import express from "express";
import { body, query, param } from "express-validator";

import * as brandController from "../controllers/brandController.js";
import { protect, isAdmin } from "../middlewares/auth.js";
import refreshToken from "../middlewares/refershToken.js";

const router = express.Router();

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================

const createOrUpdateValidation = [
  body('brandId', 'Brand ID is required and must be a non-empty string').isString().notEmpty().trim(),
  body('brandName', 'Brand Name is required and must be a non-empty string').isString().notEmpty().trim(),
];

const idParamValidation = [
  param('id', 'A numeric ID is required in the URL path').isNumeric(),
];

const getAllValidation = [
    query('limit').optional().isNumeric().toInt(),
    query('page').optional().isNumeric().toInt(),
    query('name').optional().isString().trim(),
];

// ===============================================================
// --- ROUTE DEFINITIONS (RESTful) ---
// ===============================================================

// This route group handles actions on the collection of all brands
router.route("/")
    /**
     * @route   GET /api/v1/brands
     * @desc    Get a list of all brands (paginated)
     * @access  Public
     */
    .get(
        getAllValidation,
        brandController.handleGetAllBrand
    )
    /**
     * @route   POST /api/v1/brands
     * @desc    Create a new brand
     * @access  Private (Admin)
     */
    .post(
        protect,
        isAdmin,
        createOrUpdateValidation,
        brandController.handleCreateNewBrand
    );

// This route group handles actions on a single brand resource
router.route("/:id")
    /**
     * @route   PUT /api/v1/brands/1
     * @desc    Update a brand by its numeric ID
     * @access  Private (Admin)
     */
    .put(
        protect,
        isAdmin,
        idParamValidation,
        createOrUpdateValidation,
        brandController.handleUpdateBrand
    )
    /**
     * @route   DELETE /api/v1/brands/1
     * @desc    Delete a brand by its numeric ID
     * @access  Private (Admin)
     */
    .delete(
        protect,
        isAdmin,
        idParamValidation,
        brandController.handleDeleteBrand
    );

export default router;
