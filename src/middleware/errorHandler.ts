import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import ApiError from '../utils/ApiError.js';

/**
 * The global error handling middleware for the Express application.
 * It catches all errors passed by `asyncHandler` and formats a consistent JSON response.
 *
 * @param err The error object. Can be a generic Error, a custom ApiError, or a Prisma error.
 * @param req The Express request object.
 * @param res The Express response object.
 * @param next The Express next function.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // --- 1. Log the Error ---
  // In production, you would use a dedicated logger like Winston or Pino to log to a file or service.
  console.error(err.stack);

  // --- 2. Handle Specific, Known Error Types ---

  // Handle our custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      // The stack is already captured correctly by the ApiError class
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  // Handle known Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let statusCode = 400; // Default to Bad Request for many Prisma errors
    let message = `Database Error: ${err.code}`;

    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        statusCode = 409; // Conflict
        message = `A record with this value already exists. Field: ${err.meta?.target}`;
        break;
      case 'P2025':
        // Record to update or delete not found
        statusCode = 404; // Not Found
        message = 'The requested resource was not found.';
        break;
      // You can add more specific Prisma error codes as needed by your application
      // See Prisma docs for a full list: https://www.prisma.io/docs/reference/api-reference/error-reference
    }
    return res.status(statusCode).json({ status: 'error', message });
  }

  // Handle JWT errors (if you're not handling them in the `protect` middleware)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Not authorized: ' + err.message });
  }

  // --- 3. Generic Fallback for All Other Errors ---
  // If the error is not one of our known types, it's an unexpected server error.
  return res.status(500).json({
    status: 'error',
    message: 'An unexpected internal server error occurred.',
    // Only show the stack trace in development for security reasons.
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
