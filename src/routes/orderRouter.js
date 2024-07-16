import express from "express";
import orderController from "../controllers/orderController";
import { authAdmin, orderAuthUser } from "../middlewares/auth";
import refreshToken from "../middlewares/refershToken";
let router = express.Router();

router.post(
  "/create-order",
  refreshToken,
  orderAuthUser,
  orderController.handleCreateOrder
);
router.get(
  "/get-all-order",
  refreshToken,
  orderAuthUser,
  orderController.handleGetAllOrder
);
router.get(
  "/get-order-detail",
  refreshToken,
  orderAuthUser,
  orderController.handleGetOrderDetail
);
router.put(
  "/cancle-order",
  refreshToken,
  orderAuthUser,
  orderController.handleCancleOrderDetail
);
router.get(
  "/get-all-order-admin",
  refreshToken,
  authAdmin,
  orderController.handleGetAllOrderAdmin
);
router.put(
  "/delivering-order",
  refreshToken,
  authAdmin,
  orderController.handleDeliveringOrderDetail
);
router.put(
  "/succeed-order",
  refreshToken,
  authAdmin,
  orderController.handleSucceedOrderDetail
);
router.delete(
  "/delete-order",
  refreshToken,
  authAdmin,
  orderController.handleDeleteOrder
);
router.get(
  "/order-statistics",
  refreshToken,
  authAdmin,
  orderController.handleGetStatistics
);
router.get(
  "/order-report",
  refreshToken,
  authAdmin,
  orderController.handleGetAllProductReport
);
router.post(
  "/create_payment_url",
  refreshToken,
  orderAuthUser,
  orderController.handleCreatePaymentUrl
);
router.get("/vnpay_return", orderController.handelVnPayReturn);

export default router;
