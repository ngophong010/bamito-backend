import express from "express";
import { body, query, param } from 'express-validator';
import rateLimit from "express-rate-limit";

import * as userController from "../controllers/userController.js";
import { protect, isAdmin, isOwnerOrAdmin } from "../middlewares/auth.js";
import { uploadImage } from "../middlewares/uploadImage.js";

const router = express.Router();

// --- Middleware Definitions ---

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { errCode: 429, message: "Too many authentication attempts. Please try again in 15 minutes." },
});

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================
// Note: registerValidation and loginValidation have been moved to authRouter.ts

const createUserValidation = [
  body('email', 'A valid email is required')
    .exists().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password', 'Password must be at least 6 characters long')
    .exists().withMessage('Password is required')
    .isLength({ min: 6 }),
  
  body('userName', 'User name is required')
    .exists().withMessage('User name is required')
    .not().isEmpty()
    .trim(),
  
  body('role', 'Invalid role')
    .optional()
    .isIn(['user', 'admin']), // adjust if you have more roles
];

const updateUserValidation = [
    body('email', 'A valid email is required').optional().isEmail().normalizeEmail(),
    body('userName', 'User name is required').optional().not().isEmpty().trim(),
    // Add other fields an admin or user can update
];

const changePasswordValidation = [
    body('currentPassword', 'Current password is required').not().isEmpty(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
];

const idParamValidation = [
  param('id', 'A numeric user ID is required in the URL path').isNumeric(),
];

// ===============================================================
// --- USER PROFILE ROUTES (Actions on your OWN account) ---
// ===============================================================
// All routes in this section require the user to be logged in (`protect`).

router.route("/profile")
    /**
     * @route   GET /api/v1/users/profile
     * @desc    Get the profile of the currently logged-in user
     * @access  Private (User)
     */
    .get(protect, userController.handleGetUserInfor)
    /**
     * @route   PUT /api/v1/users/profile
     * @desc    Update the profile of the currently logged-in user
     * @access  Private (User)
     */
    .put(protect, uploadImage.single('avatar'), updateUserValidation, userController.handleUpdateUser);

router.put(
    "/profile/change-password",
    protect,
    changePasswordValidation,
    userController.handleChangeProfilePassword
);

// ===============================================================
// --- ADMIN-ONLY ROUTES (Actions on ANY user) ---
// ===============================================================
// All routes in this section require the user to be an Admin (`isAdmin`).

router.route("/")
    .get(protect, isAdmin, userController.handleGetAllUser)
    .post(protect, isAdmin, createUserValidation, userController.handleCreateNewUser);

router.route("/:id")
    .get(protect, isAdmin, idParamValidation, userController.handleGetUser)
    .put(protect, isAdmin, uploadImage.single('avatar'), idParamValidation, updateUserValidation, userController.handleUpdateUser)
    .delete(protect, isAdmin, idParamValidation, userController.handleDeleteUser);

router.get("/roles/all", protect, isAdmin, userController.handleGetAllRole);
export default router;
