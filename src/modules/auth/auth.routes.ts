import express from "express";
import { body, query } from 'express-validator';
import rateLimit from "express-rate-limit";

import {
  handleRegister,
  handleLogin,
  handleActivateAccount,
  handleForgotPassword,
  handleResetPassword,
} from "./auth.controller.js";

const router = express.Router();

// --- Rate Limiting Middleware ---
// Apply this to routes that can be abused
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { message: "Too many authentication attempts. Please try again in 15 minutes." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// --- Validation Chains ---
const registerValidation = [
    body('email', 'A valid email is required').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    body('userName', 'User name is required').not().isEmpty().trim(),
    body('roleId', 'A numeric roleId is required').isNumeric(),
];

const loginValidation = [
    body('email', 'A valid email is required').isEmail().normalizeEmail(),
    body('password', 'Password cannot be empty').not().isEmpty(),
];

const resetPasswordValidation = [
    body('email', 'A valid email is required').isEmail().normalizeEmail(),
    body('otpCode', 'OTP code is required').isString().isLength({ min: 6, max: 6 }),
    body('password', 'New password must be at least 6 characters').isLength({ min: 6 }),
];

// --- Route Definitions ---

router.post('/register', authLimiter, registerValidation, handleRegister);
router.post('/login', authLimiter, loginValidation, handleLogin);
router.get('/activate', query('token', 'Activation token is required').isString().notEmpty(), handleActivateAccount);
router.post('/forgot-password', authLimiter, body('email').isEmail(), handleForgotPassword);
router.post('/reset-password', resetPasswordValidation, handleResetPassword);

export default router;
