import express from "express";
import { body, query, param } from 'express-validator';

import * as feedBackController from "../controllers/feedBackController.js";
import { feedbackAuthUser, commonAuthUser, authAdmin } from "../middlewares/auth.js";
import refreshToken from "../middlewares/refershToken.js";

const router = express.Router();

// --- Validation Chains ---
const createFeedbackValidation = [
  body('userId', 'User ID is required').isNumeric(),
  body('productId', 'Product ID is required').isNumeric(),
  body('orderId', 'Order ID is required').isNumeric(),
  body('sizeId', 'Size ID is required').isNumeric(),
  body('rating', 'Rating is required and must be a number between 1 and 5').isFloat({ min: 1, max: 5 }),
  body('description', 'Description must be a string').optional().isString(),
];

const updateFeedbackValidation = [
  body('rating', 'Rating must be a number between 1 and 5').optional().isFloat({ min: 1, max: 5 }),
  body('description', 'Description must be a string').optional().isString(),
];

const idParamValidation = [
  param('id', 'A numeric feedback ID is required in the URL path').isNumeric(),
];

const getFeedbackValidation = [
  query('productId', 'A numeric product ID is required in the query string').isNumeric(),
];

// router.post(
//   "/create-feedback",
//   refreshToken,
//   feedbackAuthUser,
//   feedBackController.handleCreateNewFeedBack
// );
// router.delete(
//   "/delete-feedback",
//   refreshToken,
//   feedbackAuthUser,
//   feedBackController.handleDeleteFeedBack
// );
// router.put(
//   "/update-feedback",
//   refreshToken,
//   feedbackAuthUser,
//   feedBackController.handleUpdateFeedBack
// );
// router.get("/get-all-feedback", feedBackController.handleGetAllFeedBack);

router.post(
  "/", // POST /api/feedback
  refreshToken,
  commonAuthUser,
  createFeedbackValidation,
  feedBackController.handleCreateNewFeedBack
);

router.get(
  "/", // GET /api/feedback?productId=123
  getFeedbackValidation,
  feedBackController.handleGetAllFeedBack
);

router.put(
  "/:id", // PUT /api/feedback/1
  refreshToken,
  commonAuthUser, // Or authAdmin, depending on your rules
  idParamValidation,
  updateFeedbackValidation,
  feedBackController.handleUpdateFeedBack
);

router.delete(
  "/:id", // DELETE /api/feedback/1
  refreshToken,
  authAdmin, // Deleting feedback is often an admin-only action
  idParamValidation,
  feedBackController.handleDeleteFeedBack
);

export default router;
