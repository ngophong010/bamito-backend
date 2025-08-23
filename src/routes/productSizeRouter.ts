import express from "express";
import { body, query, param } from 'express-validator';

import * as productSizeController from "../controllers/productSizeController.js";
import { authAdmin } from "../middlewares/auth.js";
import refreshToken from "../middlewares/refershToken.js";

const router = express.Router();

// --- Validation Chains ---
const createValidation = [
  body('productId', 'A numeric product ID is required').isNumeric(),
  body('sizeId', 'A numeric size ID is required').isNumeric(),
  body('quantity', 'Quantity is required and must be a non-negative number').isInt({ min: 0 }),
];

const updateValidation = [
  body('productId', 'Product ID must be a number').optional().isNumeric(),
  body('sizeId', 'Size ID must be a number').optional().isNumeric(),
  body('quantity', 'Quantity must be a non-negative number').optional().isInt({ min: 0 }),
];

const idParamValidation = [
  param('id', 'A numeric ID is required in the URL path').isNumeric(),
];

const getValidation = [
  query('productId', 'A numeric product ID is required in the query string').isNumeric(),
];

// router.post(
//   "/create-product-size",
//   refreshToken,
//   authAdmin,
//   productSizeController.handleCreateNewProductSize
// );
// router.delete(
//   "/delete-product-size",
//   refreshToken,
//   authAdmin,
//   productSizeController.handleDeleteProductSize
// );
// router.put(
//   "/update-product-size",
//   refreshToken,
//   authAdmin,
//   productSizeController.handleUpdateProductSize
// );
// router.get(
//   "/get-all-product-size",
//   refreshToken,
//   authAdmin,
//   productSizeController.handleGetAllProductSize
// );

// --- Route Definitions (RESTful) ---

router.post(
  "/", // POST /api/product-sizes
  refreshToken,
  authAdmin,
  createValidation,
  productSizeController.handleCreateNewProductSize
);

router.get(
  "/", // GET /api/product-sizes?productId=123
  getValidation,
  productSizeController.handleGetAllProductSize
);

router.put(
  "/:id", // PUT /api/product-sizes/1
  refreshToken,
  authAdmin,
  idParamValidation,
  updateValidation,
  productSizeController.handleUpdateProductSize
);

router.delete(
  "/:id", // DELETE /api/product-sizes/1
  refreshToken,
  authAdmin,
  idParamValidation,
  productSizeController.handleDeleteProductSize
);

export default router;
