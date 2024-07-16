import express from "express";
import brandController from "../controllers/brandController";
import { authAdmin } from "../middlewares/auth";
import refreshToken from "../middlewares/refershToken";
let router = express.Router();

router.post(
  "/create-brand",
  refreshToken,
  authAdmin,
  brandController.handleCreateNewBrand
);
router.delete(
  "/delete-brand",
  refreshToken,
  authAdmin,
  brandController.handleDeleteBrand
);
router.put(
  "/update-brand",
  refreshToken,
  authAdmin,
  brandController.handleUpdateBrand
);
router.get("/get-all-brand", brandController.handleGetAllBrand);
export default router;
