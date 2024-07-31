import express from "express";
import userController from "../controllers/userController";
import uploadCloud from "../middlewares/uploadImg";
import { authAdmin, commonAuthUser } from "../middlewares/auth";
import refreshToken from "../middlewares/refershToken";
let router = express.Router();

router.post("/login", userController.handleLogin);
router.get(
  "/get-user-infor",
  refreshToken,
  commonAuthUser,
  userController.handleGetUserInfor
);
router.post("/register", userController.handleRegister);
router.get("/auth-email", userController.handleAuthenRegister);
router.post(
  "/create-user",
  refreshToken,
  authAdmin,
  userController.handleCreateNewUser
);
router.delete(
  "/delete-user",
  refreshToken,
  authAdmin,
  userController.handleDeleteUser
);
router.put(
  "/update-user",
  uploadCloud.single("avatar"),
  refreshToken,
  commonAuthUser,
  userController.handleUpdateUser
);
router.post("/send-otp-code", userController.handleSendOtpCode);
router.put("/change-password", userController.handleChangePassword);
router.put(
  "/change-password-profile",
  refreshToken,
  commonAuthUser,
  userController.handleChangeProfilePassword
);
router.get(
  "/get-user",
  refreshToken,
  commonAuthUser,
  userController.handleGetUser
);
router.get(
  "/get-all-user",
  refreshToken,
  authAdmin,
  userController.handleGetAllUser
);
router.get(
  "/get-all-role",
  refreshToken,
  authAdmin,
  userController.handleGetAllRole
);
router.get(
  "/check-email",
  refreshToken,
  authAdmin,
  userController.handleCheckEmail
);
export default router;
