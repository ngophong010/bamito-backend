import express from "express";
import sizeController from "../controllers/sizeController";
import { authAdmin } from "../middlewares/auth";
import refreshToken from "../middlewares/refershToken";
let router = express.Router();

router.post(
  "/create-size",
  refreshToken,
  authAdmin,
  sizeController.handleCreateNewSize
);
router.delete(
  "/delete-size",
  refreshToken,
  authAdmin,
  sizeController.handleDeleteSize
);
router.put(
  "/update-size",
  refreshToken,
  authAdmin,
  sizeController.handleUpdateSize
);
router.get(
  "/get-all-size",
  refreshToken,
  authAdmin,
  sizeController.handleGetAllSize
);
router.get(
  "/get-all-size-product-type",
  refreshToken,
  authAdmin,
  sizeController.handleGetAllSizeProductType
);
export default router;
