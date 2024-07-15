import express from "express";
import cartController from "../controllers/cartController";
import { commonAuthUser } from "../middlewares/auth";
let router = express.Router();

router.post("/create-cart", commonAuthUser, cartController.handleCreateNewCart);
router.post(
  "/add-product-to-cart",
  commonAuthUser,
  cartController.handleAddProductToCart
);
router.get(
  "/get-all-product-cart",
  commonAuthUser,
  cartController.handleGetAllProductCart
);
router.put(
  "/update-product-cart",
  commonAuthUser,
  cartController.handleUpdateProductCart
);
router.delete(
  "/delete-product-cart",
  commonAuthUser,
  cartController.handleDeleteProductCart
);

export default router;
