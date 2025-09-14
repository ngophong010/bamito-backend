import express from "express";
import { body, query, param } from "express-validator";

import {
  handleCreateSize,
  handleDeleteSize,
  handleUpdateSize,
  handleGetAllSizes,
  handleGetAllSizesByCategory,
} from "./size.controller.js";
import { protect, isAdmin } from "../../middleware/auth.js";

const router = express.Router();

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================

const createValidation = [
  body('sizeId', 'Size ID is required').isString().notEmpty().trim(),
  body('sizeName', 'Size Name is required').isString().notEmpty().trim(),
  body('productTypeId', 'A numeric productTypeId is required').isNumeric(),
];

const updateValidation = [
  body('sizeId', 'Size ID must be a string').optional().isString().notEmpty().trim(),
  body('sizeName', 'Size Name must be a string').optional().isString().notEmpty().trim(),
  body('productTypeId', 'Product Type ID must be a number').optional().isNumeric(),
];

const idParamValidation = [
  param('id', 'A numeric ID is required in the URL path').isNumeric(),
];

const getAllValidation = [
    query('limit').optional().isNumeric().toInt(),
    query('page').optional().isNumeric().toInt(),
    query('name').optional().isString().trim(),
];

const getByProductTypeValidation = [
    query('productTypeId', 'A numeric productTypeId is required').isNumeric().toInt(),
];

// ===============================================================
// --- ROUTE DEFINITIONS (RESTful & Explicit) ---
// ===============================================================

/**
 * @route   GET /api/sizes/by-product-type?productTypeId=1
 * @desc    Get all sizes for a specific product type
 * @access  Public
 */
router.get(
    "/by-product-type",
    getByProductTypeValidation,
    handleGetAllSizesByCategory // Use the dedicated controller
);

router.route("/")
    /**
     * @route   GET /api/sizes
     * @desc    Get a paginated list of all sizes (for admin)
     * @access  Public
     */
    .get(
        getAllValidation,
        handleGetAllSizes // Updated function name
    )
    /**
     * @route   POST /api/sizes
     * @desc    Create a new size
     * @access  Private (Admin)
     */
    .post(
        protect,
        isAdmin,
        createValidation,
        handleCreateSize // Updated function name
    );

router.route("/:id")
    /**
     * @route   PUT /api/sizes/:id
     * @desc    Update a size by its numeric ID
     * @access  Private (Admin)
     */
    .put(
        protect,
        isAdmin,
        idParamValidation,
        updateValidation,
        handleUpdateSize // Updated function name
    )
    /**
     * @route   DELETE /api/sizes/:id
     * @desc    Delete a size by its numeric ID
     * @access  Private (Admin)
     */
    .delete(
        protect,
        isAdmin,
        idParamValidation,
        handleDeleteSize // Updated function name
    );

export default router;
