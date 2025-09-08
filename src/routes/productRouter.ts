import express from "express";
import { body, query, param } from 'express-validator';

import * as productController from "../controllers/productController.js";
import * as feedbackController from "../controllers/feedBackController.js"; // Feedback logic is separate
import { protect, isAdmin } from "../middlewares/auth.js";
import { uploadImage } from "../middlewares/uploadImage.js";

const router = express.Router();

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================
const createOrUpdateValidation = [
  body('productId').isString().withMessage('Product ID must be a string.').notEmpty(),
  body('name').isString().withMessage('Name must be a string.').notEmpty(),
  body('price').isNumeric().withMessage('Price must be a number.'),
  body('brandId').isNumeric().withMessage('brandId must be a numeric ID.'),
  body('productTypeId').isNumeric().withMessage('productTypeId must be a numeric ID.'),
];

const paginationValidation = [
    query('limit').optional().isNumeric().toInt(),
    query('page').optional().isNumeric().toInt(),
];

// ===============================================================
// --- PUBLIC ROUTES (No Auth Required) ---
// ===============================================================

router.get("/", paginationValidation, productController.handleGetAllProduct);
router.get("/sale-off", paginationValidation, productController.handleGetAllProductSaleOff);

router.get(
  "/types/:productTypeId",
  [param('productTypeId').isNumeric()],
  productController.handleGetAllProductOfTheProductType
);

router.get(
  "/:productId", // Using the business key for public, SEO-friendly URLs
  [param('productId').isString().notEmpty()],
  productController.handleGetProduct
);

router.get(
  "/:productId/feedback", // Nested resource for feedback
  [param('productId').isNumeric()],
  feedbackController.handleGetAllFeedBack
);

// ===============================================================
// --- ADMIN-ONLY ROUTES (Requires Auth and Admin Role) ---
// ===============================================================

router.post(
  "/", // POST /api/products
  protect,
  isAdmin,
  uploadImage.single('image'),
  createOrUpdateValidation,
  productController.handleCreateNewProduct
);

// Note: Admin actions use the numeric primary key `id` for internal operations
router.put(
  "/:id", // PUT /api/products/1
  protect,
  isAdmin,
  uploadImage.single('image'),
  [param('id').isNumeric()],
  createOrUpdateValidation,
  productController.handleUpdateProduct
);

router.delete(
  "/:id", // DELETE /api/products/1
  protect,
  isAdmin,
  [param('id').isNumeric()],
  productController.handleDeleteProduct
);

export default router;
