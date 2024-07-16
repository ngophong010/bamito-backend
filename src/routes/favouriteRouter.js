import express from "express";
import favouriteController from "../controllers/favouriteController";
import { commonAuthUser } from "../middlewares/auth";
import refreshToken from "../middlewares/refershToken";
let router = express.Router();

router.post(
  "/create-favourite",
  refreshToken,
  commonAuthUser,
  favouriteController.handleCreateNewFavourite
);
router.delete(
  "/delete-favourite",
  refreshToken,
  commonAuthUser,
  favouriteController.handleDeleteFavourite
);
router.put(
  "/update-favourite",
  refreshToken,
  commonAuthUser,
  favouriteController.handleUpdateFavourite
);
router.get(
  "/get-all-favourite",
  refreshToken,
  commonAuthUser,
  favouriteController.handleGetAllFavourite
);
export default router;
