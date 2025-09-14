import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

import {
  createOrder,
  cancelOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderDetail,
  getAllOrdersForUser,
  getAllOrdersForAdmin,
  getStatistics,
  getSalesReport,
} from "./order.service.js";

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

// ===============================================================
// --- USER-FACING ACTIONS ---
// ===============================================================

const handleCreateOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  };
  
  // Get userId from token for security
  const userId = req.user!.id;
  const newOrder = await createOrder({ ...req.body, userId });
  res.status(201).json(newOrder);
});

const handleGetUserOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const status = Number(req.query.status);
  const { limit, page } = req.query;

  const orderData = await getAllOrdersForUser(
      userId, 
      status, 
      Number(limit) || undefined, 
      Number(page) || undefined
  );
  res.status(200).json(orderData);
});

const handleCancelOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const orderId = Number(req.params.id);
  // An `isOrderOwner` middleware would verify ownership here
  await cancelOrder(orderId);
  res.status(200).json({ message: "Order cancelled successfully." });
});

// ===============================================================
// --- ADMIN-ONLY ACTIONS ---
// ===============================================================

const handleGetAllOrdersForAdmin = asyncHandler(async (req: Request, res: Response) => {
  const status = Number(req.query.status);
  const { limit, page } = req.query;

  const orderData = await getAllOrdersForAdmin(
      status, 
      Number(limit) || undefined, 
      Number(page) || undefined
  );
  res.status(200).json(orderData);
});

const handleGetOrderDetail = asyncHandler(async (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  const orderDetails = await getOrderDetail(orderId);
  res.status(200).json(orderDetails);
});

const handleUpdateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { 
      res.status(400).json({ errors: errors.array() });
      return;
    };

  const orderId = Number(req.params.id);
  const { status } = req.body;
  const updatedOrder = await updateOrderStatus(orderId, status);
  res.status(200).json(updatedOrder);
});

const handleDeleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  await deleteOrder(orderId);
  res.status(204).send();
});

const handleGetStatistics = asyncHandler(async (req: Request, res: Response) => {
  const stats = await getStatistics();
  res.status(200).json(stats);
});

const handleGetSalesReport = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return;
  };

  const { timeStart, timeEnd, limit, page } = req.query;
  const reportData = await getSalesReport(
    new Date(timeStart as string),
    new Date(timeEnd as string),
    Number(limit) || undefined,
    Number(page) || undefined
  );
  res.status(200).json(reportData);
});

export {
    handleCreateOrder,
    handleGetUserOrders,
    handleCancelOrder,
    handleGetAllOrdersForAdmin,
    handleGetOrderDetail,
    handleUpdateOrderStatus,
    handleDeleteOrder,
    handleGetStatistics,
    handleGetSalesReport
}