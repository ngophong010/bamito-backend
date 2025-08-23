import express from "express";
import { body, query } from 'express-validator';

import * as favouriteController from "../controllers/favouriteController.js";
import { commonAuthUser } from "../middlewares/auth.js";
import refreshToken from "../middlewares/refershToken.js";

const router = express.Router();

// --- Validation Chains ---
const createValidation = [
  body('userId', 'User ID is required').isNumeric(),
  body('productId', 'Product ID is required').isNumeric(),
];

const deleteValidation = [
  query('userId', 'A numeric user ID is required').isNumeric(),
  query('productId', 'A numeric product ID is required').isNumeric(),
];

const getValidation = [
  query('userId', 'A numeric user ID is required').isNumeric(),
];

// router.post(
//   "/create-favourite",
//   refreshToken,
//   commonAuthUser,
//   favouriteController.handleCreateNewFavourite
// );
// router.delete(
//   "/delete-favourite",
//   refreshToken,
//   commonAuthUser,
//   favouriteController.handleDeleteFavourite
// );
// router.put(
//   "/update-favourite",
//   refreshToken,
//   commonAuthUser,
//   favouriteController.handleUpdateFavourite
// );
// router.get(
//   "/get-all-favourite",
//   refreshToken,
//   commonAuthUser,
//   favouriteController.handleGetAllFavourite
// );

// --- Route Definitions (RESTful) ---
// Note: We use the SAME endpoint for all actions, differentiated by the HTTP verb.

router.post(
  "/", // POST /api/favourites
  refreshToken,
  commonAuthUser,
  createValidation,
  favouriteController.handleCreateNewFavourite
);

router.get(
  "/", // GET /api/favourites?userId=123
  refreshToken,
  commonAuthUser,
  getValidation,
  favouriteController.handleGetAllFavourite
);

router.delete(
  "/", // DELETE /api/favourites?userId=123&productId=456
  refreshToken,
  commonAuthUser,
  deleteValidation,
  favouriteController.handleDeleteFavourite
);

export default router;
