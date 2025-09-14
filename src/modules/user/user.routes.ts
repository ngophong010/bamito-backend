import express from "express";
import { body, param } from 'express-validator';

// Import the refactored user controller functions
import {
  handleGetUserInfo,
  handleChangeProfilePassword,
  handleCreateUserByAdmin,
  handleUpdateUser,
  handleDeleteUser,
  handleGetAllUsers,
  handleGetAllRoles,
} from "./user.controller.js";
import { protect, isAdmin } from "../../middleware/auth.js";
import { uploadImage } from "../../middleware/uploadImage.js";

const router = express.Router();

// --- Validation Chains ---
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

// Get the profile of the currently logged-in user
router.get("/profile", protect, handleGetUserInfo);

// Update the profile of the currently logged-in user
// Note: We'd create a separate `handleUpdateProfile` controller to get the ID from req.user
router.put("/profile", protect, uploadImage.single('avatar'), updateUserValidation, handleUpdateUser);

// Change the password of the currently logged-in user
router.put(
    "/profile/change-password",
    protect,
    changePasswordValidation,
    handleChangeProfilePassword
);

// ===============================================================
// --- ADMIN-ONLY ROUTES (Actions on ANY user) ---
// ===============================================================

// All routes below require admin privileges
router.use(protect, isAdmin);

router.route("/")
    .get(handleGetAllUsers)
    .post(handleCreateUserByAdmin); // Validation would be in a separate chain

router.route("/:id")
    .put(uploadImage.single('avatar'), idParamValidation, updateUserValidation, handleUpdateUser)
    .delete(idParamValidation, handleDeleteUser);

router.get("/roles/all", handleGetAllRoles);

router.get('/users/:userId/favourites', handleGetFavouriteProductsByUser);

export default router;