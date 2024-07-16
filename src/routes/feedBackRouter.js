import express from "express";
import feedBackController from "../controllers/feedBackController";
import { feebbackAuthUser } from "../middlewares/auth";
import refreshToken from "../middlewares/refershToken";
let router = express.Router();

router.post(
  "/create-feedback",
  refreshToken,
  feebbackAuthUser,
  feedBackController.handleCreateNewFeedBack
);
router.delete(
  "/delete-feedback",
  refreshToken,
  feebbackAuthUser,
  feedBackController.handleDeleteFeedBack
);
router.put(
  "/update-feedback",
  refreshToken,
  feebbackAuthUser,
  feedBackController.handleUpdateFeedBack
);
router.get("/get-all-feedback", feedBackController.handleGetAllFeedBack);

export default router;
