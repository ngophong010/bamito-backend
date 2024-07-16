import express from "express";
import productSizeController from "../controllers/productSizeController";
let router = express.Router();
import { authAdmin } from "../middlewares/auth";
import refreshToken from "../middlewares/refershToken";

router.post(
  "/create-product-size",
  refreshToken,
  authAdmin,
  productSizeController.handleCreateNewProductSize
);
router.delete(
  "/delete-product-size",
  refreshToken,
  authAdmin,
  productSizeController.handleDeleteProductSize
);
router.put(
  "/update-product-size",
  refreshToken,
  authAdmin,
  productSizeController.handleUpdateProductSize
);
router.get(
  "/get-all-product-size",
  refreshToken,
  authAdmin,
  productSizeController.handleGetAllProductSize
);
export default router;
