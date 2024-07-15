import express from "express";
import favouriteController from "../controllers/favouriteController";
import { commonAuthUser } from "../middlewares/auth";
let router = express.Router();

router.post(
  "/create-favourite",
  commonAuthUser,
  favouriteController.handleCreateNewFavourite
);
router.delete(
  "/delete-favourite",
  commonAuthUser,
  favouriteController.handleDeleteFavourite
);
router.put(
  "/update-favourite",
  commonAuthUser,
  favouriteController.handleUpdateFavourite
);
router.get(
  "/get-all-favourite",
  commonAuthUser,
  favouriteController.handleGetAllFavourite
);
export default router;
