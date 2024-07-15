import express from "express";
import productController from "../controllers/productController";
import uploadCloud from "../middlewares/uploadImg";
import { authAdmin, commonAuthUser } from "../middlewares/auth";
let router = express.Router();

router.post(
  "/create-product",
  uploadCloud.single("image"),
  authAdmin,
  productController.handleCreateNewProduct
);
router.delete(
  "/delete-product",
  authAdmin,
  productController.handleDeleteProduct
);
router.put(
  "/update-product",
  uploadCloud.single("image"),
  authAdmin,
  productController.handleUpdateProduct
);
router.get("/get-all-product", productController.handleGetAllProduct);
router.get(
  "/get-all-product-of-the-product-type",
  productController.handleGetAllProductOfTheProductType
);
router.get("/get-product", productController.getProduct);
router.get(
  "/get-product-feedback",
  commonAuthUser,
  productController.handleGetAllProuctFeedback
);
router.get(
  "/get-product-sale-off",
  productController.handleGetAllProuctSaleOff
);
router.get(
  "/get-product-favourite",
  commonAuthUser,
  productController.handleGetAllProuctFavourite
);

router.get("/get-product-name", productController.handleGetNameProduct);

export default router;
