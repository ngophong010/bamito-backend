import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import asyncHandler from 'express-async-handler';
import db from "../models/index.js";
import * as jwtService from "../services/jwtService.js";

// --- TYPES (from our custom.d.ts) ---
interface JwtPayload {
  id: number;
  role: string;
}

const ACCESS_KEY = process.env.ACCESS_KEY!;
if (!ACCESS_KEY) {
  throw new Error("FATAL ERROR: JWT ACCESS_KEY is not defined.");
}

// ====================================================================
//  1. AUTHENTICATION MIDDLEWARE (The Gatekeeper)
// ====================================================================
/**
 * @desc    Verifies JWT and attaches user payload to the request object.
 *          This is the primary authentication middleware.
 */
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided." });
    return;
  }

  try {
    // jwt.verify is synchronous when used without a callback.
    const decoded = jwt.verify(token, ACCESS_KEY) as JwtPayload;
    
    // Attach the user payload to the request for subsequent middlewares to use.
    req.user = { id: decoded.id, role: decoded.role };

    next(); // User is authenticated, proceed to the next step.
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed." });
  }
});

/**
 * @desc    Generate a new access token using a refresh token.
 * @route   POST /api/auth/refresh-token
 * @access  Public (but requires a valid refresh token cookie)
 */
export const handleRefreshToken = asyncHandler(async (req: Request, res: Response) => {
  const refresh_token = req.cookies.refresh_token;

  if (!refresh_token) {
    res.status(401).json({ message: "Not authorized, no refresh token provided." });
    return;
  }

  // The refactored service now handles the logic cleanly.
  const message = await jwtService.refreshTokenService(refresh_token);

  if (message.errCode === 0) {
    // Set the new access token in a secure cookie
    res.cookie("access_token", message.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: "/",
      sameSite: "lax",
    });
    res.status(200).json({ message: "Access token refreshed successfully." });
  } else {
    // If the refresh token is invalid/expired, send a forbidden status
    res.status(403).json(message);
  }
});

// ====================================================================
//  2. AUTHORIZATION MIDDLEWARES (The Bouncers)
// ====================================================================

/**
 * @desc    Authorization middleware to check if the user is an Admin.
 *          MUST be used *after* the `protect` middleware.
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'R1') {
    next(); // User is an Admin, grant access.
  } else {
    res.status(403).json({ message: "Forbidden. Admin access required." });
  }
};

/**
 * @desc    Authorization middleware to check if the user is the owner of the resource OR an Admin.
 *          MUST be used *after* the `protect` middleware.
 */
export const isOwnerOrAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Get the ID of the resource being accessed from params, body, or query
  const resourceUserId = Number(req.params.id || req.body.userId || req.query.userId);

  if (req.user && (req.user.role === 'R1' || req.user.id === resourceUserId)) {
    next(); // User is an Admin OR they own the resource. Grant access.
  } else {
    res.status(403).json({ message: "Forbidden. You do not have permission to access this resource." });
  }
});

/**
 * @desc    Specialized authorization for checking order ownership.
 *          MUST be used *after* the `protect` middleware.
 */
export const isOrderOwnerOrAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const orderId = Number(req.params.id || req.body.orderId || req.query.orderId);

    if (!req.user) {
      res.status(401).json({ message: "Not authorized." });
      return;
    };
    
    // Admins can access any order
    if (req.user.role === 'R1') {
        return next();
    }

    // Check if the order belongs to the user
    const order = await db.Order.findOne({ where: { id: orderId, userId: req.user.id }});

    if (order) {
        next(); // The user owns this order. Grant access.
    } else {
        res.status(403).json({ message: "Forbidden. You do not own this order." });
    }
});
