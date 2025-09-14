import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import asyncHandler from 'express-async-handler';
import { prisma } from '../lib/prisma.js';

import { verifyAccessToken } from '../utils/jwt.js';
import type { UserPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// ===============================================================
// 1. AUTHENTICATION MIDDLEWARE ("The Gatekeeper")
// ===============================================================

/**
 * Verifies a JWT access token from cookies and attaches the user payload to `req.user`.
 * Throws a 401 error if the token is missing, invalid, or expired.
 */
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided.' });
    return;
  }

  try {
    // Use our dedicated JWT utility to verify the token
    const decoded = verifyAccessToken(token);
    
    // Optional but recommended: Check if the user still exists in the DB
    const user = await prisma.user.findUnique({ where: { id: decoded.id, status: 1 }});
    if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found.' });
        return;
    }

    // Attach the user payload to the request for use in subsequent controllers/middleware
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed.' });
  }
});


// ===============================================================
// 2. AUTHORIZATION MIDDLEWARES ("The Bouncers")
// ===============================================================
// These middlewares MUST run *after* the `protect` middleware.

/**
 * Checks if the authenticated user has the 'ADMIN' role.
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // We can assume req.user exists because `protect` ran first.
  if (req.user && req.user.role === 'ADMIN') { // Use a clear string role name
    next();
  } else {
    res.status(403).json({ message: "Forbidden. Admin access required." });
  }
};

/**
 * Checks if the authenticated user is the owner of a resource OR an admin.
 * This is a generic check for resources that have a `userId` field.
 */
export const isOwnerOrAdmin = (
    model: keyof typeof prisma, // The Prisma model to check (e.g., 'feedback', 'order')
    paramIdName: string = 'id' // The name of the ID in req.params (e.g., 'id')
) => asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized.' });

    // Admins can always proceed.
    if (req.user.role === 'ADMIN') return next();

    const resourceId = Number(req.params[paramIdName]);
    if (isNaN(resourceId)) {
        return res.status(400).json({ message: 'Invalid resource ID.' });
    }

    // Use Prisma's generic client to find the resource
    const resource = await (prisma[model] as any).findUnique({
        where: { id: resourceId }
    });
    
    // Check if the resource exists and if its userId matches the logged-in user's id
    if (resource && resource.userId === req.user.id) {
        return next();
    }

    res.status(403).json({ message: "Forbidden. You do not have permission to access this resource." });
});
