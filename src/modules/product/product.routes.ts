import express from "express";
import { body, query, param } from 'express-validator';

import {
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleGetProductDetails,
  handleGetAllProducts,
  handleGetAllProductsByCategory,
  handleGetAllProductsOnSale,
} from "./product.controller.js";
import {
  handleCreateFeedback,
  handleGetAllFeedbackForProduct,
} from '../feedback/feedback.controller.js';
import { 
  handleGetInventoryForProduct,
  handleCreateInventoryEntry
} from "../inventory/inventory.controller.js"

import { protect, isAdmin } from "../../middleware/auth.js";
import { uploadImage } from "../../middleware/uploadImage.js";

const router = express.Router();

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================
const createValidation = [
  body('productId').isString().notEmpty(),
  body('name').isString().notEmpty(),
  body('price').isNumeric(),
  body('brandId').isNumeric(),
  body('categoryId').isNumeric(), // Renamed from productTypeId
];

const updateValidation = [
  body('productId').optional().isString().notEmpty(),
  body('name').optional().isString().notEmpty(),
  body('price').optional().isNumeric(),
  body('brandId').optional().isNumeric(),
  body('categoryId').optional().isNumeric(),
];

const paginationValidation = [
    query('limit').optional().isNumeric().toInt(),
    query('page').optional().isNumeric().toInt(),
];

const createInventoryValidation = [
  body('sizeId', 'A numeric sizeId is required').isNumeric(),
  body('quantity', 'Quantity must be a non-negative number').isNumeric({ no_symbols: true }),
];

const createFeedbackValidation = [
    body('orderId', 'A numeric orderId is required').isNumeric(),
    body('sizeId', 'A numeric sizeId is required').isNumeric(),
    body('rating', 'Rating is required and must be a number between 1 and 5').isInt({ min: 1, max: 5 }),
    body('description', 'Description must be a string').optional().isString(),
];

// ===============================================================
// --- PUBLIC ROUTES (No Auth Required) ---
// ===============================================================

router.get("/", paginationValidation, handleGetAllProducts);
router.get("/on-sale", paginationValidation, handleGetAllProductsOnSale);

router.get(
  "/category/:categoryId",
  [param('categoryId').isNumeric()],
  handleGetAllProductsByCategory
);

router.get(
  "/:productId", // Using the business key for public-facing URLs
  [param('productId').isString().notEmpty()],
  handleGetProductDetails
);

// ===============================================================
// --- NESTED FEEDBACK ROUTES ---
// ===============================================================

router.route('/:productId/feedback')
  /**
   * @route   GET /api/products/:productId/feedback
   * @desc    Get all feedback for a specific product
   * @access  Public
   */
  .get(
      param('productId').isNumeric(),
      handleGetAllFeedbackForProduct
  )
  /**
   * @route   POST /api/products/:productId/feedback
   * @desc    Create new feedback for a specific product
   * @access  Private (User)
   */
  .post(
      protect,
      param('productId').isNumeric(),
      createFeedbackValidation,
      handleCreateFeedback
  );

// ===============================================================
// --- NESTED INVENTORY ROUTES ---
// ===============================================================

/**
 * @route   GET /api/products/:productId/inventory
 * @desc    Get all inventory entries for a specific product
 * @access  Public
 */
router.get(
  '/:productId/inventory',
  param('productId').isNumeric(),
  handleGetInventoryForProduct
);

/**
 * @route   POST /api/products/:productId/inventory
 * @desc    Create a new inventory entry for a specific product
 * @access  Private (Admin)
 */
router.post(
  '/:productId/inventory',
  protect,
  isAdmin,
  param('productId').isNumeric(),
  createInventoryValidation,
  handleCreateInventoryEntry
);

// ===============================================================
// --- ADMIN-ONLY ROUTES (Requires Auth and Admin Role) ---
// ===============================================================

router.use(protect, isAdmin); // Apply security middleware to all subsequent routes

router.post(
  "/",
  uploadImage.single('image'),
  createValidation,
  handleCreateProduct
);

// Note: Admin actions use the numeric primary key `id`
router.put(
  "/:id",
  uploadImage.single('image'),
  [param('id').isNumeric()],
  updateValidation,
  handleUpdateProduct
);

router.delete(
  "/:id",
  [param('id').isNumeric()],
  handleDeleteProduct
);

export default router;
