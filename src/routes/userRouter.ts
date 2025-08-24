import express from "express";
import { body, query, param } from 'express-validator';
import rateLimit from "express-rate-limit";

// ENHANCEMENT 1: Import the correct controller functions (named exports)
import * as userController from "../controllers/userController.js";
import * as authController from "../controllers/authController.js"

// ENHANCEMENT 2: Import the new, standardized auth middleware
import { protect, isAdmin, isOwnerOrAdmin } from "../middlewares/auth.js";

import { uploadImage } from "../middlewares/uploadImage.js";
// Note: `refreshToken` is likely part of your login/logout flow, not a general middleware.
// We will create a dedicated endpoint for it.

const router = express.Router();

// --- Middleware Definitions ---

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { errCode: 429, message: "Too many authentication attempts. Please try again in 15 minutes." },
});

// --- Validation Chains ---
const registerValidation = [
  body('email', 'A valid email is required').isEmail().normalizeEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  body('userName', 'User name is required').not().isEmpty().trim(),
];

const loginValidation = [
  body('email', 'A valid email is required').isEmail().normalizeEmail(),
  body('password', 'Password is required').not().isEmpty(),
];

const idParamValidation = [
  param('id', 'A numeric user ID is required in the URL path').isNumeric(),
];

// ===============================================================
// --- PUBLIC ROUTES (No Auth Required) ---
// ===============================================================

// A dedicated route for refreshing the access token
// router.post("/token/refresh", userController.handleRefreshToken); // You would create this controller

// ===============================================================
// --- USER PROFILE ROUTES (Requires Login) ---
// ===============================================================
// A single route group for actions related to the authenticated user's own profile.
router.route("/profile")
    .get(protect, userController.handleGetUserInfor)
    .put(protect, uploadImage.single('avatar'), userController.handleUpdateUser);

router.put("/profile/change-password", protect, [/* validation */], userController.handleChangeProfilePassword);


// ===============================================================
// --- ADMIN-ONLY ROUTES ---
// ===============================================================
// A route group for admin actions on the collection of all users
router.route("/")
    .get(protect, isAdmin, userController.handleGetAllUser)
    .post(protect, isAdmin, registerValidation, userController.handleCreateNewUser);

// A route group for admin actions on a SINGLE user
router.route("/:id")
    .get(protect, isAdmin, idParamValidation, userController.handleGetUser) // Admins can get any user by ID
    .put(protect, isAdmin, uploadImage.single('avatar'), idParamValidation, userController.handleUpdateUser) // Admins can update any user
    .delete(protect, isAdmin, idParamValidation, userController.handleDeleteUser); // Admins can delete any user

// This doesn't really belong to the user resource. It's better in its own router.
// router.get("/roles/all", protect, isAdmin, userController.handleGetAllRole);

export default router;
