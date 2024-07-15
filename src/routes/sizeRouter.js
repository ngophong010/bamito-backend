import express from "express";
import sizeController from "../controllers/sizeController";
import { authAdmin } from "../middlewares/auth";
let router = express.Router();

router.post("/create-size", authAdmin, sizeController.handleCreateNewSize);
router.delete("/delete-size", authAdmin, sizeController.handleDeleteSize);
router.put("/update-size", authAdmin, sizeController.handleUpdateSize);
router.get("/get-all-size", authAdmin, sizeController.handleGetAllSize);
router.get(
  "/get-all-size-product-type",
  authAdmin,
  sizeController.handleGetAllSizeProductType
);
export default router;
