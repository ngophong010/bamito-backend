import express from "express";
import { body, query } from 'express-validator';

import * as cartController from "../controllers/cartController.js";
import { commonAuthUser } from "../middlewares/auth.js"; // Assuming a general user auth middleware
import refreshToken from "../middlewares/refershToken.js";

const router = express.Router();

// --- Validation Chains ---
const itemValidation = [
  body('userId', 'User ID is required and must be a number').isNumeric(),
  body('productId', 'Product ID is required and must be a number').isNumeric(),
  body('sizeId', 'Size ID is required and must be a number').isNumeric(),
  body('quantity', 'Quantity is required and must be a number').isNumeric(),
  body('totalPrice', 'Total Price is required and must be a number').isNumeric(),
];

const deleteItemValidation = [
  query('userId', 'User ID is required in the query string').isNumeric(),
  query('productId', 'Product ID is required in the query string').isNumeric(),
  query('sizeId', 'Size ID is required in the query string').isNumeric(),
];

const getCartValidation = [
  query('userId', 'User ID is required in the query string').isNumeric(),
];

// router.post(
//   "/create-cart",
//   refreshToken,
//   commonAuthUser,
//   itemValidation,
//   cartController.handleAddOrUpdateItem
// );

// router.post(
//   "/add-product-to-cart",
//   refreshToken,
//   commonAuthUser,
//   cartController.handleAddProductToCart
// );
// router.get(
//   "/get-all-product-cart",
//   refreshToken,
//   commonAuthUser,
//   cartController.handleGetAllProductCart
// );
// router.put(
//   "/update-product-cart",
//   refreshToken,
//   commonAuthUser,
//   cartController.handleUpdateProductCart
// );
// router.delete(
//   "/delete-product-cart",
//   refreshToken,
//   commonAuthUser,
//   cartController.handleDeleteProductCart
// );
// A single endpoint to add or update an item
router.post(
  "/item",
  refreshToken,
  commonAuthUser,
  itemValidation,
  cartController.handleAddOrUpdateItem
);

// A single endpoint to delete an item
router.delete(
  "/item",
  refreshToken,
  commonAuthUser,
  deleteItemValidation,
  cartController.handleDeleteProductCart
);

// An endpoint to get the entire cart
router.get(
  "/", // The root of the cart router
  refreshToken,
  commonAuthUser,
  getCartValidation,
  cartController.handleGetAllProductCart
);

export default router;
