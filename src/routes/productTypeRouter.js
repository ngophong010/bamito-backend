import express from "express";
import productTypeController from "../controllers/productTypeController";
import { authAdmin } from "../middlewares/auth";
import refreshToken from "../middlewares/refershToken";
let router = express.Router();

router.post(
  "/create-product-type",
  refreshToken,
  authAdmin,
  productTypeController.handleCreateNewProductType
);
router.delete(
  "/delete-product-type",
  refreshToken,
  authAdmin,
  productTypeController.handleDeleteProductType
);
router.put(
  "/update-product-type",
  refreshToken,
  authAdmin,
  productTypeController.handleUpdateProductType
);
router.get(
  "/get-all-product-type",
  productTypeController.handleGetAllProductType
);
export default router;
