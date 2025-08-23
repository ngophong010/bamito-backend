import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

import * as cartService from "../services/cartService.js";

/**
 * @desc    Add a new item to the cart, or update its quantity if it already exists.
 *          Handles cart creation implicitly.
 * @route   POST /api/cart/item
 */
const handleAddOrUpdateItem = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // The body now contains all necessary info, including userId
  const message = await cartService.addOrUpdateCartItemService(req.body);

  // Use 200 OK for both add and update for simplicity
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

/**
 * @desc    Get all items in the user's current cart.
 * @route   GET /api/cart
 */
const handleGetAllProductCart = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const userId = Number(req.query.userId);
  const message = await cartService.getAllProductCartService(userId);

  // Use 200 OK for a successful fetch
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

/**
 * @desc    Delete a specific item (product + size) from the user's cart.
 * @route   DELETE /api/cart/item
 */
const handleDeleteProductCart = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const userId = Number(req.query.userId);
  const productId = Number(req.query.productId);
  const sizeId = Number(req.query.sizeId);

  const message = await cartService.deleteProductCartService(userId, productId, sizeId);

  // Use 200 OK for a successful deletion
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

export {
  handleAddOrUpdateItem,
  handleGetAllProductCart,
  handleDeleteProductCart,
};
