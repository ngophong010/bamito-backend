import express from "express";
import orderController from "../controllers/orderController";
import { authAdmin, orderAuthUser } from "../middlewares/auth";
let router = express.Router();

router.post("/create-order", orderAuthUser, orderController.handleCreateOrder);
router.get("/get-all-order", orderAuthUser, orderController.handleGetAllOrder);
router.get(
  "/get-order-detail",
  orderAuthUser,
  orderController.handleGetOrderDetail
);
router.put(
  "/cancle-order",
  orderAuthUser,
  orderController.handleCancleOrderDetail
);
router.get(
  "/get-all-order-admin",
  authAdmin,
  orderController.handleGetAllOrderAdmin
);
router.put(
  "/delivering-order",
  authAdmin,
  orderController.handleDeliveringOrderDetail
);
router.put(
  "/succeed-order",
  authAdmin,
  orderController.handleSucceedOrderDetail
);
router.delete("/delete-order", authAdmin, orderController.handleDeleteOrder);
router.get("/order-statistics", authAdmin, orderController.handleGetStatistics);
router.get(
  "/order-report",
  authAdmin,
  orderController.handleGetAllProductReport
);
router.post(
  "/create_payment_url",
  orderAuthUser,
  orderController.handleCreatePaymentUrl
);
router.get("/vnpay_return", orderController.handelVnPayReturn);

export default router;
