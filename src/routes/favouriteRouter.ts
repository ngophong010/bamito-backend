import express from "express";
import { body, query, param } from 'express-validator';

import * as favouriteController from "../controllers/favouriteController.js";
import { protect, isOwnerOrAdmin } from "../middleware/auth.js";

const router = express.Router();

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================
const createFavouriteValidation = [
  body('productId', 'Product ID is required and must be a number').isNumeric(),
];

const deleteFavouriteValidation = [
  // The product to unfavourite is now identified by a single ID in the URL path
  param('productId', 'A numeric product ID is required in the URL path').isNumeric(),
];

// ===============================================================
// --- ROUTE DEFINITIONS (RESTful) ---
// ===============================================================

// This route group handles actions on the user's collection of favourites
router.route("/")
    /**
     * @route   GET /api/v1/favourites
     * @desc    Get all of the current user's favourite product IDs
     * @access  Private (User)
     */
    .get(
        protect,
        favouriteController.handleGetAllFavourite
    )
    /**
     * @route   POST /api/v1/favourites
     * @desc    Add a product to the current user's favourites
     * @access  Private (User)
     */
    .post(
        protect,
        createFavouriteValidation,
        favouriteController.handleCreateNewFavourite
    );

// This route handles actions on a SINGLE favourite item
router.route("/:productId")
    /**
     * @route   DELETE /api/v1/favourites/456
     * @desc    Remove a product from the user's favourites
     * @access  Private (User)
     */
    .delete(
        protect,
        deleteFavouriteValidation,
        favouriteController.handleDeleteFavourite
    );

export default router;
