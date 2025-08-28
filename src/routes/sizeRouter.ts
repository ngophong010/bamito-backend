import express from "express";
import { body, query, param } from "express-validator";

import * as sizeController from "../controllers/sizeController.js";
import { protect, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================

const createOrUpdateValidation = [
  body('sizeId', 'Size ID is required and must be a non-empty string').isString().notEmpty().trim(),
  body('sizeName', 'Size Name is required and must be a non-empty string').isString().notEmpty().trim(),
  body('productTypeId', 'A numeric productTypeId is required').isNumeric(),
];

const idParamValidation = [
  param('id', 'A numeric ID is required in the URL path').isNumeric(),
];

const getAllValidation = [
    query('limit').optional().isNumeric().toInt(),
    query('page').optional().isNumeric().toInt(),
    query('name').optional().isString().trim(),
    // This allows filtering sizes by product type, e.g., for admin panels
    query('productTypeId').optional().isNumeric().toInt(),
];

// ===============================================================
// --- ROUTE DEFINITIONS (RESTful) ---
// ===============================================================

router.route("/")
    /**
     * @route   GET /api/v1/sizes
     * @desc    Get all sizes (paginated for admin, or filtered by productType for users)
     * @access  Public
     */
    .get(
        getAllValidation,
        sizeController.handleGetAllSize
    )
    /**
     * @route   POST /api/v1/sizes
     * @desc    Create a new size
     * @access  Private (Admin)
     */
    .post(
        protect,
        isAdmin,
        createOrUpdateValidation,
        sizeController.handleCreateNewSize
    );

router.route("/:id")
    /**
     * @route   PUT /api/v1/sizes/1
     * @desc    Update a size by its numeric ID
     * @access  Private (Admin)
     */
    .put(
        protect,
        isAdmin,
        idParamValidation,
        createOrUpdateValidation,
        sizeController.handleUpdateSize
    )
    /**
     * @route   DELETE /api/v1/sizes/1
     * @desc    Delete a size by its numeric ID
     * @access  Private (Admin)
     */
    .delete(
        protect,
        isAdmin,
        idParamValidation,
        sizeController.handleDeleteSize
    );

export default router;
