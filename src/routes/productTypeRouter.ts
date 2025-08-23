import express from "express";
import { body, query, param } from 'express-validator';

import * as productTypeController from "../controllers/productTypeController.js";
import { authAdmin } from "../middlewares/auth.js";
import refreshToken from "../middlewares/refershToken.js";

const router = express.Router();

// --- Validation Chains ---
const createOrUpdateValidation = [
  body('productTypeId', 'Product Type ID is required').isString().notEmpty().trim(),
  body('productTypeName', 'Product Type Name is required').isString().notEmpty().trim(),
];

const idParamValidation = [
  param('id', 'A numeric ID is required in the URL path').isNumeric(),
];

const productTypeIdParamValidation = [
  param('productTypeId', 'A Product Type ID string is required in the URL path').isString().notEmpty(),
];

// router.post(
//   "/create-product-type",
//   refreshToken,
//   authAdmin,
//   productTypeController.handleCreateNewProductType
// );
// router.delete(
//   "/delete-product-type",
//   refreshToken,
//   authAdmin,
//   productTypeController.handleDeleteProductType
// );
// router.put(
//   "/update-product-type",
//   refreshToken,
//   authAdmin,
//   productTypeController.handleUpdateProductType
// );
// router.get(
//   "/get-all-product-type",
//   productTypeController.handleGetAllProductType
// );

// router.get("/get-product-type", productTypeController.handleGetProductType);

router.post(
  "/", // POST /api/product-types
  refreshToken,
  authAdmin,
  createOrUpdateValidation,
  productTypeController.handleCreateNewProductType
);

router.get(
  "/", // GET /api/product-types?limit=10&page=1
  productTypeController.handleGetAllProductType
);

router.get(
  "/:productTypeId", // GET /api/product-types/VOTCAULONG
  productTypeIdParamValidation,
  productTypeController.handleGetProductType
);

router.put(
  "/:id", // PUT /api/product-types/1
  refreshToken,
  authAdmin,
  idParamValidation,
  createOrUpdateValidation,
  productTypeController.handleUpdateProductType
);

router.delete(
  "/:id", // DELETE /api/product-types/1
  refreshToken,
  authAdmin,
  idParamValidation,
  productTypeController.handleDeleteProductType
);

export default router;
