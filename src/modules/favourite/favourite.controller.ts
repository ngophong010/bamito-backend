import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

// Use named imports for the refactored service functions
import {
  addProductToFavourites,
  removeProductFromFavourites,
  getFavouritedProductIds,
  getFavouritedProducts,
  getFavouritedProductsByUser,
} from "./favourite.service.js";

// A custom interface to add the 'user' property to the Request object
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    // ... other user properties from your token payload
  };
}

/**
 * @desc    Add a product to the logged-in user's favourites
 * @route   POST /api/profile/favourites
 * @access  Private (User)
 */
export const handleAddFavourite = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ status: "fail", data: errors.mapped() });
    return;
  }

  // CRITICAL: Get userId from the authenticated token, not the request body.
  const userId = req.user!.id;
  const { productId } = req.body;

  const newFavourite = await addProductToFavourites(userId, productId);
  res.status(201).json({ status: "success", data: newFavourite });
});

/**
 * @desc    Get a paginated list of full favourite products for the logged-in user
 * @route   GET /api/profile/favourites
 * @access  Private (User)
 */
export const handleGetFavouritedProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { limit, page } = req.query;

    const favouritesData = await getFavouritedProducts(
        userId,
        Number(limit) || undefined,
        Number(page) || undefined
    );
    res.status(200).json({ status: "success", data: favouritesData });
});

/**
 * @desc    Get all favourite product IDs for the logged-in user
 * @route   GET /api/profile/favourites/ids
 * @access  Private (User)
 */
export const handleGetFavouritedProductIds = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const favouriteIds = await getFavouritedProductIds(userId);
  res.status(200).json({ status: "success", data: favouriteIds });
});

/**
 * @desc    [ADMIN] Get a paginated list of favourite products for a specific user
 * @route   GET /api/users/:userId/favourites
 * @access  Private (Admin)
 */
export const handleGetFavouritedProductsByUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const { limit, page } = req.query;

    const favouritesData = await getFavouritedProductsByUser(
        userId,
        Number(limit) || undefined,
        Number(page) || undefined
    );
    res.status(200).json({ status: "success", data: favouritesData });
});

/**
 * @desc    Remove a product from the logged-in user's favourites
 * @route   DELETE /api/profile/favourites/:productId
 * @access  Private (User)
 */
export const handleRemoveFavourite = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ status: "fail", data: errors.mapped() });
    return;
  }

  const userId = req.user!.id;
  const productId = Number(req.params.productId);

  await removeProductFromFavourites(userId, productId);
  res.status(204).json({ status: "success", data: null });
});
