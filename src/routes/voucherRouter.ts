import express from "express";
import { body, query, param } from 'express-validator';

import * as voucherController from "../controllers/voucherController.js";
import uploadImage from "../middlewares/uploadImage.js";
import { authAdmin } from "../middlewares/auth.js";
import refreshToken from "../middlewares/refershToken.js";

const router = express.Router();

// --- Validation Chains ---
const voucherValidation = [
  body('voucherId', 'Voucher ID is required').isString().notEmpty(),
  body('voucherPrice', 'Voucher Price is required').isNumeric(),
  body('quantity', 'Quantity is required').isNumeric(),
  // isISO8601 ensures it's a valid date string (e.g., "2024-12-31T17:00:00.000Z")
  body('timeStart', 'Start time is required and must be a valid date').isISO8601().toDate(),
  body('timeEnd', 'End time is required and must be a valid date').isISO8601().toDate(),
];

const idParamValidation = [
  param('id', 'A numeric voucher ID is required in the URL path').isNumeric(),
];

// router.post(
//   "/create-voucher",
//   uploadImage.single("image"),
//   authAdmin,
//   voucherController.handleCreateNewVoucher
// );
// router.delete("/delete-voucher", voucherController.handleDeleteVoucher);
// router.put(
//   "/update-voucher",
//   uploadImage.single("image"),
//   authAdmin,
//   voucherController.handleUpdateVoucher
// );
// router.get(
//   "/get-all-voucher",
//   authAdmin,
//   voucherController.handleGetAllVoucher
// );
// router.get("/get-all-voucher-user", voucherController.handleGetAllVoucherUser);

// This route is for USERS (public)
router.get("/", voucherController.handleGetAllVoucherUser);

// These routes are for ADMINS
router.get(
  "/all", // GET /api/vouchers/all
  refreshToken,
  authAdmin,
  voucherController.handleGetAllVoucher
);

router.post(
  "/", // POST /api/vouchers
  refreshToken,
  authAdmin,
  uploadImage.single('image'), // Multer middleware to handle the file upload
  voucherValidation,
  voucherController.handleCreateNewVoucher
);

router.put(
  "/:id", // PUT /api/vouchers/1
  refreshToken,
  authAdmin,
  uploadImage.single('image'),
  idParamValidation,
  voucherValidation,
  voucherController.handleUpdateVoucher
);

router.delete(
  "/:id", // DELETE /api/vouchers/1
  refreshToken,
  authAdmin,
  idParamValidation,
  voucherController.handleDeleteVoucher
);


export default router;
