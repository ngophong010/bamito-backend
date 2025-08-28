import express from "express";
import { body, query, param } from 'express-validator';
import * as orderController from "../controllers/orderController.js";
import { protect, isAdmin, isOrderOwnerOrAdmin } from "../middlewares/auth.js";

const router = express.Router();

// --- Validation Chains ---
const createOrderValidation = [
  body('totalPrice').isNumeric(),
  body('payment').isString().notEmpty(),
  body('deliveryAddress').isString().notEmpty(),
  body('status').isNumeric(),
  body('cartItems').isArray({ min: 1 }),
  body('cartItems.*.productId').isNumeric(),
  body('cartItems.*.sizeId').isNumeric(),
  body('cartItems.*.quantity').isInt({ min: 1 }),
];

const updateStatusValidation = [
  body('status', 'A numeric status is required').isNumeric(),
];

const idParamValidation = [
  param('id', 'A numeric order ID is required in the URL path').isNumeric(),
];

// ===============================================================
// --- USER-FACING ROUTES (Requires Login) ---
// ===============================================================
router.post("/", protect, createOrderValidation, orderController.handleCreateOrder);
router.post("/create-payment-url", protect, createOrderValidation, orderController.handleCreatePaymentUrl);
router.get("/", protect, [query('status').isNumeric()], orderController.handleGetAllOrder);

router.get(
  "/:id",
  protect,
  idParamValidation,
  isOrderOwnerOrAdmin, // <-- The new, secure authorization middleware
  orderController.handleGetOrderDetail
);

router.put(
  "/:id/cancel",
  protect,
  idParamValidation,
  isOrderOwnerOrAdmin, // <-- The new, secure authorization middleware
  orderController.handleCancelOrder
);

// ===============================================================
// --- PUBLIC CALLBACK ROUTES ---
// ===============================================================
router.get("/vnpay-return", orderController.handleVnPayReturn);

// ===============================================================
// --- ADMIN-ONLY ROUTES ---
// ===============================================================
router.get("/admin/all", protect, isAdmin, [query('status').isNumeric()], orderController.handleGetAllOrderAdmin);
router.get("/admin/statistics", protect, isAdmin, orderController.handleGetStatistics);
router.get(
  "/admin/reports/products",
  protect,
  isAdmin,
  [query('timeStart').isISO8601(), query('timeEnd').isISO8601()],
  orderController.handleGetAllProductReport
);

router.put(
  "/admin/:id/status",
  protect,
  isAdmin,
  idParamValidation,
  updateStatusValidation,
  orderController.handleUpdateOrderStatus
);

router.delete(
  "/admin/:id",
  protect,
  isAdmin,
  idParamValidation,
  orderController.handleDeleteOrder
);

export default router;
