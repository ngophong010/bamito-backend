import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

import * as feedBackService from "../services/feedBackService.js";

/**
 * @desc    Create a new feedback for a product
 * @route   POST /api/feedback
 * @access  Private (User)
 */
const handleCreateNewFeedBack = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const message = await feedBackService.createNewFeedBackService(req.body);
  res.status(message.errCode === 0 ? 201 : 400).json(message);
});

/**
 * @desc    Delete a feedback
 * @route   DELETE /api/feedback/:id
 * @access  Private (Admin or Owner)
 */
const handleDeleteFeedBack = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const feedbackId = Number(req.params.id);
  const message = await feedBackService.deleteFeedbackService(feedbackId);
  res.status(message.errCode === 0 ? 200 : 404).json(message); // Use 404 if not found
});

/**
 * @desc    Update a feedback
 * @route   PUT /api/feedback/:id
 * @access  Private (Owner)
 */
const handleUpdateFeedBack = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const feedbackId = Number(req.params.id);
  const message = await feedBackService.updateFeedbackService({ feedbackId, ...req.body });
  res.status(message.errCode === 0 ? 200 : 404).json(message); // Use 404 if not found
});

/**
 * @desc    Get all feedback for a specific product
 * @route   GET /api/feedback
 * @access  Public
 */
const handleGetAllFeedBack = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const productId = Number(req.query.productId);
  const message = await feedBackService.getAllFeedbackService(productId);
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

export {
  handleCreateNewFeedBack,
  handleDeleteFeedBack,
  handleUpdateFeedBack,
  handleGetAllFeedBack,
};
