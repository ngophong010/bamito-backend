import express from "express";
import { body, query, param } from 'express-validator';
import rateLimit from "express-rate-limit";

import userController from "../controllers/userController.js";
import { uploadImage } from "../middlewares/uploadImage.js";
import { authAdmin, commonAuthUser } from "../middlewares/auth.js";
import refreshToken from "../middlewares/refershToken.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    errCode: 429,
    message: "Too many requests, please try again later.",
  },
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

// router.post("/login", userController.handleLogin);
// router.get(
//   "/get-user-infor",
//   refreshToken,
//   commonAuthUser,
//   userController.handleGetUserInfor
// );
// router.post("/register", userController.handleRegister);
// router.get("/auth-email", userController.handleAuthenRegister);
// router.post(
//   "/create-user",
//   refreshToken,
//   authAdmin,
//   userController.handleCreateNewUser
// );
// router.delete(
//   "/delete-user",
//   refreshToken,
//   authAdmin,
//   userController.handleDeleteUser
// );
// router.put(
//   "/update-user",
//   uploadCloud.single("avatar"),
//   refreshToken,
//   commonAuthUser,
//   userController.handleUpdateUser
// );
// router.post("/send-otp-code", userController.handleSendOtpCode);
// router.put("/change-password", userController.handleChangePassword);
// router.put(
//   "/change-password-profile",
//   refreshToken,
//   commonAuthUser,
//   userController.handleChangeProfilePassword
// );
// router.get(
//   "/get-user",
//   refreshToken,
//   commonAuthUser,
//   userController.handleGetUser
// );
// router.get(
//   "/get-all-user",
//   refreshToken,
//   authAdmin,
//   userController.handleGetAllUser
// );
// router.get(
//   "/get-all-role",
//   refreshToken,
//   authAdmin,
//   userController.handleGetAllRole
// );
// router.post(
//   "/send-sms",
//   userController.handleSendSMSOtpCode
// );
// router.get(
//   "/check-email",
//   refreshToken,
//   authAdmin,
//   userController.handleCheckEmail
// );

// AUTHENTICATION
router.post("/register", authLimiter, registerValidation, userController.handleRegister);
router.post("/login", authLimiter, loginValidation, userController.handleLogin);
router.get("/activate", [query('token').notEmpty()], userController.handleAuthenRegister); // GET /api/users/activate?token=...

// PASSWORD MANAGEMENT
router.post("/password/send-otp", [body('email').isEmail()], userController.handleSendOtpCode);
router.put("/password/reset-with-otp", [/* validation */], userController.handleChangePassword);

// CURRENT USER PROFILE (requires login)
router.get("/profile", refreshToken, commonAuthUser, userController.handleGetUserInfor);
router.put("/profile/change-password", refreshToken, commonAuthUser, [/* validation */], userController.handleChangeProfilePassword);
router.put(
  "/profile/update",
  refreshToken,
  commonAuthUser,
  uploadImage.single('avatar'),
  // Add validation for user profile fields here
  userController.handleUpdateUser 
);

// --- ADMIN CRUD FOR USERS ---

router.get(
  "/", // GET /api/users
  refreshToken,
  authAdmin,
  userController.handleGetAllUser
);

router.post(
  "/", // POST /api/users
  refreshToken,
  authAdmin,
  // Add validation for creating a user from the admin panel
  userController.handleCreateNewUser
);

router.get(
  "/:id", // GET /api/users/123
  refreshToken,
  authAdmin,
  idParamValidation,
  userController.handleGetUser
);

router.put(
  "/:id", // PUT /api/users/123
  refreshToken,
  authAdmin,
  uploadImage.single('avatar'),
  idParamValidation,
  // Add validation for updating a user from the admin panel
  userController.handleUpdateUser
);

router.delete(
  "/:id", // DELETE /api/users/123
  refreshToken,
  authAdmin,
  idParamValidation,
  userController.handleDeleteUser
);

// This doesn't really belong to the user resource, could be in its own router
router.get("/roles/all", refreshToken, authAdmin, userController.handleGetAllRole);

export default router;
