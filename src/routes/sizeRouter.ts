import express from "express";
import { body, query } from "express-validator";
import * as sizeController from "../controllers/sizeController.js";
import { authAdmin } from "../middlewares/auth.js";
import refreshToken from "../middlewares/refershToken.js";

const router = express.Router();

const createSizeValidation = [
  body('sizeId', 'Size ID is required').isString().notEmpty(),
  body('sizeName', 'Size Name is required').isString().notEmpty(),
  body('productTypeId', 'A numeric productTypeId is required').isNumeric(),
];

const deleteSizeValidation = [
  query('id', 'A numeric size ID is required').isNumeric(),
];

router.post(
  "/create-size",
  refreshToken,
  authAdmin,
  createSizeValidation,
  sizeController.handleCreateNewSize
);

router.delete(
  "/delete-size",
  refreshToken,
  authAdmin,
  deleteSizeValidation,
  sizeController.handleDeleteSize
);

router.put(
  "/update-size",
  refreshToken,
  authAdmin,
  createSizeValidation,
  sizeController.handleUpdateSize
);

router.get("/get-all-size", sizeController.handleGetAllSize);

router.get(
  "/get-all-size-product-type",
  [query('productTypeId', 'A numeric productTypeId is required').isNumeric()], // Add validation
  sizeController.handleGetAllSizeProductType
);

export default router;
