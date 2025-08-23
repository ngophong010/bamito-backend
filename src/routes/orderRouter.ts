import express from "express";
import { body, query, param } from 'express-validator';
import * as orderController from "../controllers/orderController.js";
import { authAdmin, commonAuthUser } from "../middlewares/auth.js"; // Use your standardized auth middleware
import refreshToken from "../middlewares/refershToken.js";

const router = express.Router();

// --- Validation Chains ---
const createOrderValidation = [
  body('userId').isNumeric(),
  body('totalPrice').isNumeric(),
  body('payment').isString().notEmpty(),
  body('deliveryAddress').isString().notEmpty(),
  body('status').isNumeric(),
  body('cartItems').isArray({ min: 1 }),
  body('cartItems.*.productId').isNumeric(),
  body('cartItems.*.sizeId').isNumeric(),
  body('cartItems.*.quantity').isNumeric({ min: 1 }),
];

const updateStatusValidation = [
  body('status', 'A numeric status is required').isNumeric(),
];

const idParamValidation = [
  param('id', 'A numeric order ID is required in the URL path').isNumeric(),
];

// router.post(
//   "/create-order",
//   refreshToken,
//   orderAuthUser,
//   orderController.handleCreateOrder
// );
// router.get(
//   "/get-all-order",
//   refreshToken,
//   orderAuthUser,
//   orderController.handleGetAllOrder
// );
// router.get(
//   "/get-order-detail",
//   refreshToken,
//   orderAuthUser,
//   orderController.handleGetOrderDetail
// );
// router.put(
//   "/cancle-order",
//   refreshToken,
//   orderAuthUser,
//   orderController.handleCancleOrderDetail
// );
// router.get(
//   "/get-all-order-admin",
//   refreshToken,
//   authAdmin,
//   orderController.handleGetAllOrderAdmin
// );
// router.put(
//   "/delivering-order",
//   refreshToken,
//   authAdmin,
//   orderController.handleDeliveringOrderDetail
// );
// router.put(
//   "/succeed-order",
//   refreshToken,
//   authAdmin,
//   orderController.handleSucceedOrderDetail
// );
// router.delete(
//   "/delete-order",
//   refreshToken,
//   authAdmin,
//   orderController.handleDeleteOrder
// );
// router.get(
//   "/order-statistics",
//   refreshToken,
//   authAdmin,
//   orderController.handleGetStatistics
// );
// router.get(
//   "/order-report",
//   refreshToken,
//   authAdmin,
//   orderController.handleGetAllProductReport
// );
// router.post(
//   "/create_payment_url",
//   refreshToken,
//   orderAuthUser,
//   orderController.handleCreatePaymentUrl
// );
// router.get("/vnpay_return", orderController.handelVnPayReturn);

// Create an order (e.g., for COD) or get a payment URL
router.post("/", refreshToken, commonAuthUser, createOrderValidation, orderController.handleCreateOrder);
router.post("/create-payment-url", refreshToken, commonAuthUser, createOrderValidation, orderController.handleCreatePaymentUrl);
router.get("/vnpay-return", orderController.handleVnPayReturn);

// Get a list of the current user's orders
router.get("/", refreshToken, commonAuthUser, [query('status').isNumeric()], orderController.handleGetAllOrder);

// Get details for a specific order
router.get("/:id", refreshToken, commonAuthUser, idParamValidation, orderController.handleGetOrderDetail);

// Cancel an order (user action)
router.put(
  "/:id/cancel", // PUT /api/orders/123/cancel
  refreshToken,
  commonAuthUser,
  idParamValidation,
  orderController.handleCancelOrder
);

// --- ADMIN-ONLY ROUTES ---

router.get(
  "/admin/all", // GET /api/orders/admin/all?status=1
  refreshToken,
  authAdmin,
  [query('status').isNumeric()],
  orderController.handleGetAllOrderAdmin
);

router.get(
  "/admin/statistics", // GET /api/orders/admin/statistics
  refreshToken,
  authAdmin,
  orderController.handleGetStatistics
);

router.get(
  "/admin/reports/products", // GET /api/orders/admin/reports/products?timeStart=...
  refreshToken,
  authAdmin,
  [query('timeStart').isISO8601(), query('timeEnd').isISO8601()],
  orderController.handleGetAllProductReport
);

router.put(
  "/admin/:id/status", // PUT /api/orders/admin/123/status
  refreshToken,
  authAdmin,
  idParamValidation,
  updateStatusValidation,
  orderController.handleUpdateOrderStatus // The generic status updater
);

router.delete(
  "/admin/:id", // DELETE /api/orders/admin/123
  refreshToken,
  authAdmin,
  idParamValidation,
  orderController.handleDeleteOrder
);

export default router;
