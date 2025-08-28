import express from "express";
import { body, query, param } from 'express-validator';

import * as productSizeController from "../controllers/productSizeController.js";
import { protect, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================

const createValidation = [
  body('productId', 'A numeric product ID is required').isNumeric(),
  body('sizeId', 'A numeric size ID is required').isNumeric(),
  body('quantity', 'Quantity is required and must be a non-negative integer').isInt({ min: 0 }),
];

// For updating, an admin is most likely only changing the inventory count.
const updateValidation = [
  body('quantity', 'Quantity is required and must be a non-negative integer').isInt({ min: 0 }),
];

const idParamValidation = [
  param('id', 'A numeric ID is required in the URL path').isNumeric(),
];

const getValidation = [
  query('productId', 'A numeric product ID is required in the query string').isNumeric(),
];

// ===============================================================
// --- ROUTE DEFINITIONS (RESTful) ---
// ===============================================================

router.route("/")
    /**
     * @route   GET /api/v1/product-sizes?productId=123
     * @desc    Get all inventory entries for a specific product
     * @access  Public
     */
    .get(
        getValidation,
        productSizeController.handleGetAllProductSize
    )
    /**
     * @route   POST /api/v1/product-sizes
     * @desc    Create a new inventory entry for a product/size combination
     * @access  Private (Admin)
     */
    .post(
        protect,
        isAdmin,
        createValidation,
        productSizeController.handleCreateNewProductSize
    );

router.route("/:id")
    /**
     * @route   PUT /api/v1/product-sizes/1
     * @desc    Update the inventory quantity for a product size entry
     * @access  Private (Admin)
     */
    .put(
        protect,
        isAdmin,
        idParamValidation,
        updateValidation,
        productSizeController.handleUpdateProductSize
    )
    /**
     * @route   DELETE /api/v1/product-sizes/1
     * @desc    Delete a product size entry
     * @access  Private (Admin)
     */
    .delete(
        protect,
        isAdmin,
        idParamValidation,
        productSizeController.handleDeleteProductSize
    );

export default router;
