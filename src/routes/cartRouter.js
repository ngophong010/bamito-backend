import express from "express";
import cartController from "../controllers/cartController";
import { commonAuthUser } from "../middlewares/auth";
import refreshToken from "../middlewares/refershToken";
let router = express.Router();

router.post(
  "/create-cart",
  refreshToken,
  commonAuthUser,
  cartController.handleCreateNewCart
);
router.post(
  "/add-product-to-cart",
  refreshToken,
  commonAuthUser,
  cartController.handleAddProductToCart
);
router.get(
  "/get-all-product-cart",
  refreshToken,
  commonAuthUser,
  cartController.handleGetAllProductCart
);
router.put(
  "/update-product-cart",
  refreshToken,
  commonAuthUser,
  cartController.handleUpdateProductCart
);
router.delete(
  "/delete-product-cart",
  refreshToken,
  commonAuthUser,
  cartController.handleDeleteProductCart
);

export default router;
