import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";

import { 
  registerUser,
  loginUser,
  activateUserAccount,
  sendPasswordResetOtp,
  resetUserPassword,
  refreshAccessToken, 
} from "./auth.service.js";

// --- Helper for setting cookies ---
const cookieOptions = {
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    path: "/",
    sameSite: "lax" as const, // Or "strict" for better CSRF protection
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
export const handleRegister = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    await registerUser(req.body);
    res.status(201).json({ message: "Registration successful. Please check your email to activate your account." });
});

/**
 * @desc    Log in a user and set access/refresh tokens in cookies
 * @route   POST /api/auth/login
 */
export const handleLogin = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await loginUser(email, password);
    
    // Set tokens in secure cookies
    res.cookie("access_token", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15 minutes
    res.cookie("refresh_token", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

    res.status(200).json(user); // Send back user data (without password)
});

/**
 * @desc    Activate a user's account via a token
 * @route   GET /api/auth/activate
 */
export const handleActivateAccount = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;
    await activateUserAccount(token as string);
    // Redirect to a "success" page on the front-end
    res.redirect(`${process.env.URL_CLIENT}/activation-success`);
});

/**
 * @desc    Log out a user by clearing their cookies
 * @route   POST /api/auth/logout
 */
export const handleLogout = asyncHandler(async (req: Request, res: Response) => {
    // Clear cookies by setting an empty value and an expiration date in the past.
    res.cookie("access_token", "", { ...cookieOptions, expires: new Date(0) });
    res.cookie("refresh_token", "", { ...cookieOptions, expires: new Date(0) });
    res.status(200).json({ message: "Logged out successfully." });
});

/**
 * @desc    Generate a new access token using the refresh token
 * @route   POST /api/auth/refresh-token
 */
export const handleRefreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    // The service will throw an error if the token is invalid, which will be caught
    // by the global error handler and result in a 401/403 response.
    const { newAccessToken } = await refreshAccessToken(refreshToken);

    res.cookie("access_token", newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15 mins
    res.status(200).json({ message: "Access token refreshed successfully." });
});

/**
 * @desc    Send a password reset OTP to a user's email
 * @route   POST /api/auth/forgot-password
 */
export const handleForgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { email } = req.body;
    await sendPasswordResetOtp(email);
    res.status(200).json({ message: "OTP sent successfully. Please check your email." });
});

/**
 * @desc    Reset a user's password using a valid OTP
 * @route   POST /api/auth/reset-password
 */
export const handleResetPassword = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { email, otpCode, newPassword } = req.body;
    await resetUserPassword(email, otpCode, newPassword);
    res.status(200).json({ message: "Password reset successfully." });
});
