import express from "express";
import { body, query, param } from "express-validator";

import {
  handleCreateBrand,
  handleDeleteBrand,
  handleUpdateBrand,
  handleGetAllBrands,
} from "./brand.controller.js";

import { protect, isAdmin } from "../../middleware/auth.js";

const router = express.Router();

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================

// Validation for creating a new brand
const createValidation = [
  body('brandId', 'Brand ID is required and must be a non-empty string').isString().notEmpty().trim(),
  body('brandName', 'Brand Name is required and must be a non-empty string').isString().notEmpty().trim(),
];

// Validation for updating an existing brand (often the same as creating)
const updateValidation = [
  body('brandId', 'Brand ID is required').optional().isString().notEmpty().trim(),
  body('brandName', 'Brand Name is required').optional().isString().notEmpty().trim(),
];

const idParamValidation = [
  param('id', 'A numeric ID is required in the URL path').isNumeric(),
];

const getAllValidation = [
    query('limit').optional().isNumeric().toInt(),
    query('page').optional().isNumeric().toInt(),
    query('name').optional().isString().trim(),
    query('pagination').optional().isBoolean(),
];

// ===============================================================
// --- ROUTE DEFINITIONS (RESTful) ---
// ===============================================================

router.route("/")
    /**
     * @route   GET /api/brands
     * @desc    Get a list of all brands (paginated)
     * @access  Public
     */
    .get(
        getAllValidation,
        handleGetAllBrands
    )
    /**
     * @route   POST /api/brands
     * @desc    Create a new brand
     * @access  Private (Admin)
     */
    .post(
        protect,
        isAdmin,
        createValidation,
        handleCreateBrand
    );

router.route("/:id")
    /**
     * @route   PUT /api/brands/:id
     * @desc    Update a brand by its numeric ID
     * @access  Private (Admin)
     */
    .put(
        protect,
        isAdmin,
        idParamValidation,
        updateValidation,
        handleUpdateBrand
    )
    /**
     * @route   DELETE /api/brands/:id
     * @desc    Delete a brand by its numeric ID
     * @access  Private (Admin)
     */
    .delete(
        protect,
        isAdmin,
        idParamValidation,
        handleDeleteBrand
    );

export default router;