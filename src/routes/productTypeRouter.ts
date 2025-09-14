import express from "express";
import { body, query, param } from 'express-validator';

import * as productTypeController from "../controllers/productTypeController.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================

const createOrUpdateValidation = [
  body('productTypeId', 'Product Type ID is required and must be a non-empty string').isString().notEmpty().trim(),
  body('productTypeName', 'Product Type Name is required and must be a non-empty string').isString().notEmpty().trim(),
];

const idParamValidation = [
  param('id', 'A numeric ID is required in the URL path').isNumeric(),
];

const productTypeIdParamValidation = [
  param('productTypeId', 'A Product Type ID string is required in the URL path').isString().notEmpty(),
];

// ===============================================================
// --- ROUTE DEFINITIONS (RESTful) ---
// ===============================================================

router.route("/")
    /**
     * @route   GET /api/v1/product-types
     * @desc    Get all product types (paginated for admin or full list for users)
     * @access  Public
     */
    .get(productTypeController.handleGetAllProductType)
    /**
     * @route   POST /api/v1/product-types
     * @desc    Create a new product type
     * @access  Private (Admin)
     */
    .post(
        protect,
        isAdmin,
        createOrUpdateValidation,
        productTypeController.handleCreateNewProductType
    );

router.route("/:id")
    /**
     * @route   PUT /api/v1/product-types/1
     * @desc    Update a product type by its numeric ID
     * @access  Private (Admin)
     */
    .put(
        protect,
        isAdmin,
        idParamValidation,
        createOrUpdateValidation,
        productTypeController.handleUpdateProductType
    )
    /**
     * @route   DELETE /api/v1/product-types/1
     * @desc    Delete a product type by its numeric ID
     * @access  Private (Admin)
     */
    .delete(
        protect,
        isAdmin,
        idParamValidation,
        productTypeController.handleDeleteProductType
    );

// This route uses the string business key for public-facing lookups
router.get(
  "/:productTypeId",
  productTypeIdParamValidation,
  productTypeController.handleGetProductType
);

export default router;
