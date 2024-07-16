import express from "express";
import productController from "../controllers/productController";
import uploadCloud from "../middlewares/uploadImg";
import { authAdmin, commonAuthUser } from "../middlewares/auth";
import refreshToken from "../middlewares/refershToken";
let router = express.Router();

router.post(
  "/create-product",
  uploadCloud.single("image"),
  refreshToken,
  authAdmin,
  productController.handleCreateNewProduct
);
router.delete(
  "/delete-product",
  refreshToken,
  authAdmin,
  productController.handleDeleteProduct
);
router.put(
  "/update-product",
  uploadCloud.single("image"),
  refreshToken,
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
  refreshToken,
  commonAuthUser,
  productController.handleGetAllProuctFeedback
);
router.get(
  "/get-product-sale-off",
  productController.handleGetAllProuctSaleOff
);
router.get(
  "/get-product-favourite",
  refreshToken,
  commonAuthUser,
  productController.handleGetAllProuctFavourite
);

router.get("/get-product-name", productController.handleGetNameProduct);

export default router;
