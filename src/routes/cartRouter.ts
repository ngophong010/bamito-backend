import express from "express";
import { body, query, param } from 'express-validator';

import * as cartController from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js"; 

const router = express.Router();

// --- Validation Chains ---
const itemValidation = [
  body('productId', 'Product ID is required and must be a number').isNumeric(),
  body('sizeId', 'Size ID is required and must be a number').isNumeric(),
  body('quantity', 'Quantity is required and must be a positive number').isInt({ gt: 0 }) // `gt` stands for "greater than"
    .toInt(),
];

const cartDetailIdValidation = [
  param('cartDetailId', 'A numeric cart item ID is required in the URL path').isNumeric(),
];

// ===============================================================
// --- ROUTE DEFINITIONS (RESTful) ---
// ===============================================================

// This route group handles actions on the user's cart as a whole
router.route("/")
    /**
     * @route   GET /api/v1/cart
     * @desc    Get the current user's shopping cart
     * @access  Private (User)
     */
    .get(
        protect,
        cartController.handleGetAllProductCart
    )
    /**
     * @route   POST /api/v1/cart
     * @desc    Add or update an item in the current user's cart
     * @access  Private (User)
     */
    .post(
        protect,
        itemValidation,
        cartController.handleAddOrUpdateItem
    );

// This route handles actions on a specific item WITHIN the cart
router.route("/items/:cartDetailId")
    /**
     * @route   DELETE /api/v1/cart/items/123
     * @desc    Delete a specific item from the user's cart
     * @access  Private (User)
     */
    .delete(
        protect,
        cartDetailIdValidation,
        cartController.handleDeleteProductCart
    );

export default router;
