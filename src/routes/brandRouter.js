import express from "express";
import brandController from "../controllers/brandController";
import { authAdmin } from "../middlewares/auth";
let router = express.Router();

router.post("/create-brand", authAdmin, brandController.handleCreateNewBrand);
router.delete("/delete-brand", authAdmin, brandController.handleDeleteBrand);
router.put("/update-brand", authAdmin, brandController.handleUpdateBrand);
router.get("/get-all-brand", brandController.handleGetAllBrand);
export default router;
