import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import moment from "moment";
import querystring from "qs";
import crypto from "crypto";

import * as orderService from "../services/orderService.js";
import type { ServiceResponse } from "../types/serviceResponse.js";

const handleCreateOrder = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  };
  
  const message = await orderService.createNewOrderService(req.body);
  res.status(message.errCode === 0 ? 201 : 400).json(message);
});

const handleGetAllOrder = asyncHandler(async (req: Request, res: Response) => {
  const { userId, status, limit, page } = req.query;
  const message = await orderService.getAllOrderService(Number(userId), Number(status), Number(limit), Number(page));
  res.status(200).json(message);
});

const handleGetOrderDetail = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.query;
  const message = await orderService.getOrderDetailService(Number(orderId));
  res.status(message.errCode === 0 ? 200 : 404).json(message);
});

const handleCancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const message = await orderService.cancleOrderService(req.body);
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

/**
 * @desc    Update the status of an order (e.g., to delivering, succeeded, cancelled)
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin)
 */
const handleUpdateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { 
      res.status(400).json({ errors: errors.array() });
      return;
    };

  const orderId = Number(req.params.id);
  const { status } = req.body; // The new status (e.g., 2 for delivering, 3 for succeeded)

  // Assuming you have a generic update service
  const message = await orderService.updateOrderStatus(orderId, status);
  res.status(message.errCode === 0 ? 200 : 404).json(message); // Use 404 if not found
});

/**
 * @desc    Delete an order
 * @route   DELETE /api/orders/:id
 * @access  Private (Admin)
 */
const handleDeleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  };

  const orderId = Number(req.params.id);
  const message = await orderService.deleteOrderService(orderId);
  res.status(message.errCode === 0 ? 200 : 404).json(message);
});

const handleGetAllOrderAdmin = asyncHandler(async (req: Request, res: Response) => {
  // Input validation should be handled in the router
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // Safely parse query parameters with defaults
  const status = Number(req.query.status);
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const message = await orderService.getAllOrderAdminService(
    status,
    limit,
    page
  );

  res.status(200).json(message); // No need to check errCode if service is consistent
});

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/orders/statistics
 * @access  Private (Admin)
 */
const handleGetStatistics = asyncHandler(async (req: Request, res: Response) => {
  const message = await orderService.getStatisticsService();
  res.status(200).json(message);
});

/**
 * @desc    Get a paginated sales report for a given time range
 * @route   GET /api/orders/reports/products
 * @access  Private (Admin)
 */
const handleGetAllProductReport = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return;
  };

  const { timeStart, timeEnd, limit, page } = req.query;

  const message = await orderService.getAllProductReport(
    new Date(timeStart as string),
    new Date(timeEnd as string),
    Number(limit) || 10,
    Number(page) || 1
  );
  res.status(200).json(message);
});

// --- PAYMENT GATEWAY LOGIC ---

// Helper function to sort an object's keys
const sortObject = (obj: Record<string, any>): Record<string, any> => {
  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
};

const handleCreatePaymentUrl = asyncHandler(async (req: Request, res: Response) => {
  // ENHANCEMENT 1: The stateless solution. We will encode the order data
  // into the vnp_OrderInfo field and retrieve it later.
  const orderData = {
    userId: req.body.userId,
    voucherId: req.body.voucherId,
    payment: req.body.payment,
    deliveryAddress: req.body.deliveryAddress,
    status: req.body.status,
    cartItems: req.body.cartItems, // The frontend must now send the cart items
    totalPrice: req.body.totalPrice
  };

  // Convert the order data to a URL-safe Base64 string
  const orderInfoString = Buffer.from(JSON.stringify(orderData)).toString('base64');
  
  process.env.TZ = "Asia/Ho_Chi_Minh";
  const createDate = moment(new Date()).format("YYYYMMDDHHmmss");
  const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress || '';
  const tmnCode = process.env.VNP_TMNCODE!;
  const secretKey = process.env.VNP_HASHSECRET!;
  let vnpUrl = process.env.VNP_URL!;
  const returnUrl = process.env.VNP_RETURNURL!;
  const amount = req.body.totalPrice;
  const vnp_TxnRef = createDate;

  let vnp_Params: Record<string, any> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: vnp_TxnRef,
    // Store the encoded data here
    vnp_OrderInfo: orderInfoString, 
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  vnp_Params = sortObject(vnp_Params);
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

  res.status(200).json({ urlPayment: vnpUrl });
});

const handleVnPayReturn = asyncHandler(async (req: Request, res: Response) => {
  const vnp_Params = req.query;
  const secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  const sortedParams = sortObject(vnp_Params);
  const secretKey = process.env.VNP_HASHSECRET!;
  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    // Payment is valid, now create the order
    
    // ENHANCEMENT 1: Decode the order data from the URL
    const orderInfoString = Buffer.from(vnp_Params['vnp_OrderInfo'] as string, 'base64').toString('utf8');
    const orderData = JSON.parse(orderInfoString);
    
    // Ensure the price matches
    if (orderData.totalPrice !== (Number(vnp_Params['vnp_Amount']) / 100)) {
        throw new Error("Price mismatch error.");
    }

    const message = await orderService.createNewOrderService(orderData);
    
    if (message.errCode === 0) {
      // Redirect to a "Thank You" page with the real order ID
      res.redirect(`${process.env.URL_CLIENT}/user/orders/${message.data.orderId}`);
    } else {
      // Redirect to a "Payment Failed" page
      res.redirect(`${process.env.URL_CLIENT}/payment-failed`);
    }
  } else {
    // Signature is invalid, redirect to a failed page
    res.redirect(`${process.env.URL_CLIENT}/payment-failed`);
  }
});

export {
  handleCreateOrder,
  handleDeleteOrder,
  handleCancelOrder,
  handleGetAllOrder,
  handleUpdateOrderStatus,
  handleGetOrderDetail,
  handleGetAllOrderAdmin,
  handleGetStatistics,
  handleGetAllProductReport,
  handleCreatePaymentUrl,
  handleVnPayReturn,
};
