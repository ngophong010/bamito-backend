import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

import {
  createFeedback,
  getAllFeedbackForProduct,
  updateFeedback,
  deleteFeedback,
} from "./feedback.service.js";

// A custom interface to add the 'user' property to the Request object
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    // ... other user properties from your token payload
  };
}

/**
 * @desc    Create new feedback for a product
 * @route   POST /api/products/:productId/feedback
 * @access  Private (User)
 */
export const handleCreateFeedback = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ status: "fail", data: errors.mapped() });
    return;
  }

  // Get userId from the authenticated token for security
  const userId = req.user!.id;
  // Get productId from the URL parameter for RESTful design
  const productId = Number(req.params.productId);

  // Combine all data sources for the service
  const data = { ...req.body, userId, productId };
  
  const newFeedback = await createFeedback(data);
  res.status(201).json({ status: "success", data: newFeedback });
});

/**
 * @desc    Get all feedback for a specific product
 * @route   GET /api/products/:productId/feedback
 * @access  Public
 */
export const handleGetAllFeedbackForProduct = asyncHandler(async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  const feedbacks = await getAllFeedbackForProduct(productId);

  res.status(200).json({ status: "success", data: feedbacks });
});

/**
 * @desc    Update a feedback entry
 * @route   PUT /api/feedback/:id
 * @access  Private (Owner)
 */
export const handleUpdateFeedback = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ status: "fail", data: errors.mapped() });
    return;
  }
  
  const id = Number(req.params.id);
  const updatedFeedback = await updateFeedback(id, req.body);

  res.status(200).json({ status: "success", data: updatedFeedback });
});

/**
 * @desc    Delete a feedback entry
 * @route   DELETE /api/feedback/:id
 * @access  Private (Admin or Owner)
 */
export const handleDeleteFeedback = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  // Note: Your middleware (isOwnerOrAdmin) would handle the authorization logic
  // before this controller is even called.
  await deleteFeedback(id);

  res.status(204).json({ status: "success", data: null });
});
