import express from "express";
import productSizeController from "../controllers/productSizeController";
let router = express.Router();
import { authAdmin } from "../middlewares/auth";

router.post(
  "/create-product-size",
  authAdmin,
  productSizeController.handleCreateNewProductSize
);
router.delete(
  "/delete-product-size",
  authAdmin,
  productSizeController.handleDeleteProductSize
);
router.put(
  "/update-product-size",
  authAdmin,
  productSizeController.handleUpdateProductSize
);
router.get(
  "/get-all-product-size",
  authAdmin,
  productSizeController.handleGetAllProductSize
);
export default router;
