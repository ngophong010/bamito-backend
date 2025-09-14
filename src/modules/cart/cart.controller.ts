import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

// Use named imports for the refactored service functions
import {
  addOrUpdateCartItem,
  removeCartItem,
  getCartContents,
} from "./cart.service.js";

// A custom interface to add the 'user' property to the Request object
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    // ... other user properties from your token payload
  };
}

/**
 * @desc    Add or update an item in the logged-in user's cart.
 * @route   POST /api/profile/cart/items
 * @access  Private
 */
export const handleAddOrUpdateItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // This is a "fail" response according to JSend
    res.status(400).json({ status: "fail", data: errors.mapped() });
    return;
  }

  // CRITICAL: Get userId from the authenticated token for security.
  const userId = req.user!.id;
  const { productId, sizeId, quantity } = req.body;

  const updatedItem = await addOrUpdateCartItem({ userId, productId, sizeId, quantity });
  // Use 200 OK for an upsert operation as it could be either a create or update.
  res.status(200).json({ status: "success", data: updatedItem });
});

/**
 * @desc    Get all items in the logged-in user's cart.
 * @route   GET /api/profile/cart
 * @access  Private
 */
export const handleGetCartContents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const cartContents = await getCartContents(userId);
  res.status(200).json(cartContents);
});

/**
 * @desc    Remove a specific item from the logged-in user's cart.
 * @route   DELETE /api/profile/cart/items
 * @access  Private
 */
export const handleRemoveItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ status: "fail", data: errors.mapped() });
    return;
  }
  
  const userId = req.user!.id;
  // Get product/size info from the request body for DELETE, as it's a composite key.
  const { productId, sizeId } = req.body;

  await removeCartItem(userId, productId, sizeId);
  res.status(204).send(); // Standard for successful DELETE
});
