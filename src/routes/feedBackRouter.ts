import express from "express";
import { body, query, param } from 'express-validator';

import * as feedBackController from "../controllers/feedBackController.js";
import { protect, isAdmin, isFeedbackOwnerOrAdmin } from "../middleware/auth.js";

const router = express.Router();

// --- Validation Chains ---
const createFeedbackValidation = [
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

// ===============================================================
// --- ROUTE DEFINITIONS (RESTful) ---
// ===============================================================

router.route("/")
    /**
     * @route   GET /api/v1/feedback?productId=123
     * @desc    Get all feedback for a specific product
     * @access  Public
     */
    .get(
        getFeedbackValidation,
        feedBackController.handleGetAllFeedBack
    )
    /**
     * @route   POST /api/v1/feedback
     * @desc    Create a new feedback for a product
     * @access  Private (User)
     */
    .post(
        protect,
        createFeedbackValidation,
        feedBackController.handleCreateNewFeedBack
    );

router.route("/:id")
    /**
     * @route   PUT /api/v1/feedback/1
     * @desc    Update a feedback
     * @access  Private (Owner or Admin)
     */
    .put(
        protect,
        idParamValidation,
        updateFeedbackValidation,
        isFeedbackOwnerOrAdmin,
        feedBackController.handleUpdateFeedBack
    )
    /**
     * @route   DELETE /api/v1/feedback/1
     * @desc    Delete a feedback
     * @access  Private (Admin)
     */
    .delete(
        protect,
        idParamValidation,
        isAdmin, // Deleting feedback is an admin-only action
        feedBackController.handleDeleteFeedBack
    );

export default router;
