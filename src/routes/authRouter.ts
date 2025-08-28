import express from "express";
import { body, query } from 'express-validator';

import * as authController from "../controllers/authController.js"; // Or userController
import { protect } from "../middlewares/auth.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

/**
 * @desc    Rate limiter for authentication routes to prevent brute-force attacks.
 *          Limits each IP to 10 requests per 15 minutes for sensitive endpoints.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    errCode: 429, // Too Many Requests
    message: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
  },
});

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================

/**
 * @desc    Validation rules for user registration.
 */
const registerValidation = [
  body('email', 'A valid email address is required')
    .isEmail()
    .normalizeEmail(), // Sanitizes the email (e.g., converts to lowercase)

  body('password', 'Password is required and must be at least 6 characters long')
    .isLength({ min: 6 }),

  body('userName', 'User name is required and cannot be empty')
    .not().isEmpty()
    .trim() // Removes leading/trailing whitespace
    .escape(), // Converts special HTML characters to prevent XSS attacks
  body('roleId', 'A numeric role ID is required').isNumeric(),
  ];

/**
 * @desc    Validation rules for user login.
 */
const loginValidation = [
  body('email', 'A valid email address is required')
    .isEmail()
    .normalizeEmail(),
  
  body('password', 'Password is required')
    .not().isEmpty(),
];

/**
 * @desc    Validation rules for activating an account.
 */
const activationValidation = [
    query('token', 'An activation token is required in the query string').isString().notEmpty(),
];

/**
 * @desc    Validation rules for the "Forgot Password" OTP request.
 */
const sendOtpValidation = [
    body('email', 'A valid email address is required').isEmail().normalizeEmail(),
];

/**
 * @desc    Validation rules for resetting the password using an OTP.
 */
const resetPasswordValidation = [
    body('email', 'A valid email is required').isEmail().normalizeEmail(),
    body('otpCode', 'A valid OTP code is required').isString().isLength({ min: 6, max: 6 }),
    body('password', 'New password is required and must be at least 6 characters').isLength({ min: 6 }),
];

// --- AUTHENTICATION & REGISTRATION ---
router.post("/register", authLimiter, registerValidation, authController.handleRegister);
router.post("/login", authLimiter, loginValidation,  authController.handleLogin);
router.post("/logout", protect, authController.handleLogout);
router.post("/refresh-token", authController.handleRefreshToken); // Often has its own, stricter rate limit
router.get("/activate", activationValidation, authController.handleAuthenRegister);

// --- PASSWORD RESET FLOW ---
router.post("/password/send-otp", sendOtpValidation, authController.handleSendOtpCode);
router.put("/password/reset-with-otp", resetPasswordValidation,  authController.handleChangePassword);

export default router;
