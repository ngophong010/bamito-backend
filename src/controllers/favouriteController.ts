import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

import * as favouriteService from "../services/favouriteService.js";

/**
 * @desc    Add a product to the current user's favourites
 * @route   POST /api/favourites
 * @access  Private (User)
 */
const handleCreateNewFavourite = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const message = await favouriteService.createNewFavouriteService(req.body);
  res.status(message.errCode === 0 ? 201 : 400).json(message);
});

/**
 * @desc    Remove a product from the current user's favourites
 * @route   DELETE /api/favourites
 * @access  Private (User)
 */
const handleDeleteFavourite = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const userId = Number(req.query.userId);
  const productId = Number(req.query.productId);
  const message = await favouriteService.deleteFavouriteService(userId, productId);
  res.status(message.errCode === 0 ? 200 : 404).json(message); // Use 404 if not found
});

/**
 * @desc    Get all favourite product IDs for the current user
 * @route   GET /api/favourites
 * @access  Private (User)
 */
const handleGetAllFavourite = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const userId = Number(req.query.userId);
  const message = await favouriteService.getAllFavouriteService(userId);
  res.status(200).json(message);
});

export {
  handleCreateNewFavourite,
  handleDeleteFavourite,
  handleGetAllFavourite,
};
