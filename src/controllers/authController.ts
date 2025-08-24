import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from "express-validator";

import * as userService from "../services/userService.js"
import * as jwtService from "../services/jwtService.js";

// ... other controller functions like handleLogin, handleRegister ...
export const handleLogin = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  const { email, password } = req.body;
  const message = await userService.loginService(email, password);
  
  if (message.errCode === 0) {
    const { access_token, refresh_token } = message.data; // Data is now nested in the `data` property
    
    // Set secure, httpOnly cookies
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        path: "/",
        sameSite: "lax" as const, // Use 'strict' or 'lax' for better security
    };
    res.cookie("access_token", access_token, cookieOptions);
    res.cookie("refresh_token", refresh_token, cookieOptions);
    
    res.status(200).json(message);
  } else {
    res.status(400).json(message);
  }
});

// --- AUTHENTICATION & REGISTRATION ---

export const handleRegister = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const message = await userService.registerService(req.body);
  // Any unexpected errors are now caught by asyncHandler and sent to the global handler.
  res.status(message.errCode === 0 ? 201 : 400).json(message);
});

export const handleAuthenRegister = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const token = req.query.token as string;
  const message = await userService.autherRegister(token);

  // Redirect based on the service's predictable response
  if (message.errCode === 0) {
    res.redirect(`${process.env.URL_CLIENT}/login`);
  } else {
    res.redirect(`${process.env.URL_CLIENT}/not-found`);
  }
});

/**
 * @desc    Log out the current user
 * @route   POST /api/auth/logout
 * @access  Private (User)
 */
export const handleLogout = asyncHandler(async (req: Request, res: Response) => {
  // To "clear" a cookie, you set it with the same name and options,
  // but with an empty value and an expiration date in the past.
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Must match the original cookie's options
    sameSite: "lax" as const,
    path: "/",
  };

  res.cookie("access_token", "", {
    ...cookieOptions,
    expires: new Date(0), // Set the expiration to the beginning of time
  });

  res.cookie("refresh_token", "", {
    ...cookieOptions,
    expires: new Date(0),
  });

  res.status(200).json({ errCode: 0, message: "Logged out successfully." });
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

export const handleSendOtpCode = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const message = await userService.sendOtpCodeService(req.body.email);
  res.status(message.errCode === 0 ? 200 : 404).json(message);
});

export const handleChangePassword = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
    };

  const message = await userService.changePasswordService(req.body);
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});