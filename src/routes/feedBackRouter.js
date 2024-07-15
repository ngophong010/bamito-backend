import express from "express";
import feedBackController from "../controllers/feedBackController";
import { feebbackAuthUser } from "../middlewares/auth";
let router = express.Router();

router.post(
  "/create-feedback",
  feebbackAuthUser,
  feedBackController.handleCreateNewFeedBack
);
router.delete(
  "/delete-feedback",
  feebbackAuthUser,
  feedBackController.handleDeleteFeedBack
);
router.put(
  "/update-feedback",
  feebbackAuthUser,
  feedBackController.handleUpdateFeedBack
);
router.get("/get-all-feedback", feedBackController.handleGetAllFeedBack);

export default router;
