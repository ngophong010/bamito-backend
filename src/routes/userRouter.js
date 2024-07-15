import express from "express";
import userController from "../controllers/userController";
import uploadCloud from "../middlewares/uploadImg";
import { authAdmin, commonAuthUser } from "../middlewares/auth";
let router = express.Router();

router.post("/login", userController.handleLogin);
router.get(
  "/get-user-infor",
  commonAuthUser,
  userController.handleGetUserInfor
);
router.post("/register", userController.handleRegister);
router.get("/auth-email", userController.handleAuthenRegister);
router.post("/create-user", authAdmin, userController.handleCreateNewUser);
router.delete("/delete-user", authAdmin, userController.handleDeleteUser);
router.put(
  "/update-user",
  uploadCloud.single("avatar"),
  commonAuthUser,
  userController.handleUpdateUser
);
router.post("/send-otp-code", userController.handleSendOtpCode);
router.put("/change-password", userController.handleChangePassword);
router.put(
  "/change-password-profile",
  commonAuthUser,
  userController.handleChangeProfilePassword
);
router.get("/get-user", commonAuthUser, userController.handleGetUser);
router.get("/get-all-user", authAdmin, userController.handleGetAllUser);
router.get("/get-all-role", authAdmin, userController.handleGetAllRole);
router.post("/refresh-token", userController.handleRefreshToken);

export default router;
