import express from "express";
import { body, query, param } from 'express-validator';

import * as voucherController from "../controllers/voucherController.js";
import { protect, isAdmin } from "../middlewares/auth.js";
import { uploadImage } from "../middlewares/uploadImage.js";

const router = express.Router();

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================

const voucherValidation = [
  body('voucherId', 'Voucher ID is required').isString().notEmpty(),
  body('voucherPrice', 'Voucher Price is required').isNumeric(),
  body('quantity', 'Quantity is required and must be a non-negative integer').isInt({ min: 0 }),
  // isISO8601 ensures it's a valid date string (e.g., "2024-12-31T17:00:00.000Z")
  body('timeStart', 'Start time is required and must be a valid ISO 8601 date').isISO8601().toDate(),
  body('timeEnd', 'End time is required and must be a valid ISO 8601 date').isISO8601().toDate(),
];


const idParamValidation = [
  param('id', 'A numeric voucher ID is required in the URL path').isNumeric(),
];

// ===============================================================
// --- ROUTE DEFINITIONS (RESTful) ---
// ===============================================================

router.route("/")
    /**
     * @route   GET /api/v1/vouchers
     * @desc    Get all active vouchers for users OR a paginated list for admins
     * @access  Public / Private (Admin)
     */
    .get(voucherController.handleGetAllVoucher) // This single controller now handles both cases
    /**
     * @route   POST /api/v1/vouchers
     * @desc    Create a new voucher
     * @access  Private (Admin)
     */
    .post(
        protect,
        isAdmin,
        uploadImage.single('image'),
        voucherValidation,
        voucherController.handleCreateNewVoucher
    );

router.route("/:id")
    /**
     * @route   PUT /api/v1/vouchers/1
     * @desc    Update a voucher by its numeric ID
     * @access  Private (Admin)
     */
    .put(
        protect,
        isAdmin,
        uploadImage.single('image'),
        idParamValidation,
        voucherValidation,
        voucherController.handleUpdateVoucher
    )
    /**
     * @route   DELETE /api/v1/vouchers/1
     * @desc    Delete a voucher by its numeric ID
     * @access  Private (Admin)
     */
    .delete(
        protect,
        isAdmin,
        idParamValidation,
        voucherController.handleDeleteVoucher
    );

export default router;
