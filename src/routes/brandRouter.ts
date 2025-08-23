import express from "express";
import { body, query, param } from "express-validator";
import * as brandController from "../controllers/brandController.js";
import { authAdmin } from "../middlewares/auth.js";
import refreshToken from "../middlewares/refershToken.js";

const router = express.Router();

const createBrandValidation = [
  body('brandId', 'Brand ID is required and must be a string').isString().notEmpty().trim(),
  body('brandName', 'Brand Name is required and must be a string').isString().notEmpty().trim(),
];

const updateBrandValidation = [
  body('id', 'Brand ID is required and must be a number').isNumeric(),
  body('brandId', 'Brand ID is required and must be a string').isString().notEmpty().trim(),
  body('brandName', 'Brand Name is required and must be a string').isString().notEmpty().trim(),
];

const deleteBrandValidation = [
  query('id', 'Brand ID is required and must be a string').isNumeric(),
];

router.post(
  "/create-brand",
  refreshToken,
  authAdmin,
  createBrandValidation,
  brandController.handleCreateNewBrand
);

router.delete(
  "/delete-brand",
  refreshToken,
  authAdmin,
  deleteBrandValidation,
  brandController.handleDeleteBrand
);

router.put(
  "/update-brand",
  refreshToken,
  authAdmin,
  updateBrandValidation,
  brandController.handleUpdateBrand
);

router.get("/get-all-brand", brandController.handleGetAllBrand);

export default router;
