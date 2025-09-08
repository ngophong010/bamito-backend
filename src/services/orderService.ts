import {Op} from "sequelize";
import { v4 as uuidv4 } from "uuid";
import db, {sequelize} from "../models/index.js";
import type { ServiceResponse } from "../types/serviceResponse.js";

interface OrderData {
  userId: number;
  totalPrice: number;
  payment: string;
  deliveryAddress: string;
  status: number;
  voucherId?: number; // Optional voucher PRIMARY KEY
  cartItems: { productId: number; sizeId: number; quantity: number; totalPrice: number }[];
}

// --- TYPES ---
interface OrderCancelData {
  orderId: number; // Use the integer PK
  orderDetail: {
    productId: number;
    sizeId: number;
    quantity: number;
  }[];
}

// --- CREATE ORDER (The Transactional Method) ---
const createNewOrderService = async (data: OrderData): Promise<ServiceResponse> => {
  const { userId, totalPrice, payment, deliveryAddress, status, voucherId, cartItems } = data;
  if (!userId || !totalPrice || !payment || !deliveryAddress || !cartItems || cartItems.length === 0) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  // ENHANCEMENT 1: Wrap the entire creation process in a managed transaction
  try {
    const result = await sequelize.transaction(async (t) => {
      // Step 1: Create the Order header
      const order = await db.Order.create({
        orderId: uuidv4().slice(-10),
        userId,
        voucherId: voucherId || null,
        totalPrice,
        payment,
        deliveryAddress,
        status,
      }, { transaction: t });

      // Step 2: If a voucher was used, decrement its quantity
      if (voucherId) {
        await db.Voucher.decrement('quantity', { by: 1, where: { id: voucherId }, transaction: t });
      }

      // Step 3: Prepare and create the OrderHistory (line items)
      const orderHistoryItems = cartItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        sizeId: item.sizeId,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      }));
      await db.Order_History.bulkCreate(orderHistoryItems, { transaction: t });

      // Step 4: ENHANCEMENT 3 - Decrement inventory for each product size efficiently
      for (const item of cartItems) {
        await db.Product_Size.decrement('quantity', {
          by: item.quantity,
          where: { productId: item.productId, sizeId: item.sizeId },
          transaction: t,
        });
        await db.Product_Size.increment('sold', {
            by: item.quantity,
            where: { productId: item.productId, sizeId: item.sizeId },
            transaction: t,
        })
      }

      // Step 5: Clear the user's cart
      const cart = await db.Cart.findOne({ where: { userId }, transaction: t });
      if (cart) {
        await db.Cart_Detail.destroy({ where: { cartId: cart.id }, transaction: t });
      }

      // If all steps succeed, the transaction commits automatically.
      return { errCode: 0, message: "Order created successfully.", data: { orderId: order.orderId } };
    });
    return result;
  } catch (error) {
    console.error("Order creation transaction failed:", error);
    // If any step fails, the transaction automatically rolls back.
    // The asyncHandler in the controller will catch this and send a 500 error.
    throw error;
  }
};

// --- ORDER STATUS UPDATES ---
const updateOrderStatus = async (orderId: number, status: number): Promise<ServiceResponse> => {
    if(!orderId) {
        return { errCode: 1, message: "Missing required order ID!" };
    }
    const [updatedRows] = await db.Order.update({ status }, { where: { orderId } });

    if (updatedRows > 0) {
        return { errCode: 0, message: `Order status updated to ${status}.` };
    } else {
        return { errCode: 2, message: "Order not found." };
    }
}
// These functions now become simple, clean calls to the helper
const deliveringOrderService = (orderId: number) => updateOrderStatus(orderId, 2);
const succeedOrderService = (orderId: number) => updateOrderStatus(orderId, 3);

// --- CANCEL ORDER (The Transactional Method) ---
const cancleOrderService = async (data: OrderCancelData): Promise<ServiceResponse> => {
  if (!data.orderId || !data.orderDetail) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  // ENHANCEMENT 1: Wrap the entire operation in a managed transaction for data integrity.
  try {
    const result = await sequelize.transaction(async (t) => {
      // Step 1: Find and update the order's status
      const [updatedRows] = await db.Order.update(
        { status: 0 }, // 0 = Cancelled
        { where: { id: data.orderId }, transaction: t }
      );

      if (updatedRows === 0) {
        throw new Error("Order not found."); // This will automatically roll back the transaction
      }

      // Step 2: Restore inventory for each item in the cancelled order
      for (const item of data.orderDetail) {
        await db.Product_Size.increment('quantity', {
          by: item.quantity,
          where: { productId: item.productId, sizeId: item.sizeId },
          transaction: t,
        });
      }
      return { errCode: 0, message: "Order cancelled successfully and inventory restored." };
    });
    return result;
  } catch (error) {
    console.error("Cancel order transaction failed:", error);
    throw error; // Let asyncHandler handle the unexpected error
  }
};

// --- DELETE ORDER ---
const deleteOrderService = async (orderId: number): Promise<ServiceResponse> => {
  if (!orderId) {
    return { errCode: 1, message: "Missing required order ID!" };
  }
  // `onDelete: 'CASCADE'` in the migration will handle deleting related Order_History items.
  const deletedRowCount = await db.Order.destroy({ where: { id: orderId } });
  if (deletedRowCount === 0) {
    return { errCode: 2, message: "Order not found." };
  }
  return { errCode: 0, message: "Order deleted successfully." };
};

// --- GET STATISTICS (The Efficient Method) ---
const getStatisticsService = async (): Promise<ServiceResponse> => {
  // ENHANCEMENT 2: Use efficient, single queries for each statistic
  const totalIncomePromise = db.Order.sum('totalPrice', { where: { status: 3 } });
  const totalOrderPromise = db.Order.count();
  const totalProductPromise = db.Product.count();
  const totalOrderWaitingPromise = db.Order.count({ where: { status: 1 } });
  const totalOrderDeliveringPromise = db.Order.count({ where: { status: 2 } });
  const totalOrderSuccessPromise = db.Order.count({ where: { status: 3 } });
  const totalOrderCancelPromise = db.Order.count({ where: { status: 0 } });

  // Run all count queries in parallel for maximum speed
  const [
    totalIncome,
    totalOrder,
    totalProduct,
    totalOrderWaiting,
    totalOrderDelivering,
    totalOrderSuccess,
    totalOrderCancel,
  ] = await Promise.all([
    totalIncomePromise, totalOrderPromise, totalProductPromise,
    totalOrderWaitingPromise, totalOrderDeliveringPromise, totalOrderSuccessPromise, totalOrderCancelPromise,
  ]);

  return {
    errCode: 0,
    data: {
      totalIncome: totalIncome || 0,
      totalOrder,
      totalProduct,
      allTotalOrder: [
        { label: "Xác nhận", quantity: totalOrderWaiting },
        { label: "Đang giao", quantity: totalOrderDelivering },
        { label: "Hoàn tất", quantity: totalOrderSuccess },
        { label: "Đã hủy", quantity: totalOrderCancel },
      ],
    },
    message: "Get statis service success"
  };
};

// --- GET ORDER DETAIL (The Efficient Method) ---
const getOrderDetailService = async (orderId: number): Promise<ServiceResponse> => {
  if (!orderId) {
    return { errCode: 1, message: "Missing required order ID!" };
  }

  // ENHANCEMENT 2: Use a single, powerful query with nested includes.
  const order = await db.Order.findOne({
    where: { id: orderId },
    include: [
      { model: db.User, as: "userData", attributes: ["userName", "phoneNumber"] },
      { model: db.Voucher, as: "voucherData", attributes: ["voucherId", "voucherPrice"] },
      {
        model: db.Order_History,
        as: "orderHistory",
        include: [
          { model: db.Size, as: "SizeOrderDetailData", attributes: ["sizeId", "sizeName"] },
          { model: db.Product, as: "ProductDetailData", attributes: ["productId", "image", "name", "price", "discount"] },
        ],
      },
    ],
  });

  if (!order) {
    return { errCode: 2, message: "Order not found." };
  }
  return { errCode: 0, data: order, message: "Get all Order success" };
};

// --- GET ALL ORDERS (User) ---
const getAllOrderService = async (userId: number, status: number, limit?: number, page?: number): Promise<ServiceResponse> => {
    // This implementation was already quite good, we just need to add types and defaults.
    const effectiveLimit = limit || 10;
    const offset = ((page || 1) - 1) * effectiveLimit;

    const { count, rows } = await db.Order.findAndCountAll({
        where: { userId, status },
        limit: effectiveLimit,
        offset,
        order: [["id", "DESC"]],
        attributes: { exclude: ["updatedAt", "userId", "id", "deliveryAddress"] }
    });
    return {
        errCode: 0,
        data: { totalItems: count, totalPages: Math.ceil(count / effectiveLimit), currentPage: page || 1, orders: rows },
        message: "Get all order services"
    };
};

// --- GET ALL ORDERS (Admin) ---
const getAllOrderAdminService = async (status: number, limit?: number, page?: number): Promise<ServiceResponse> => {
    // This implementation was also good, just needs types and defaults.
    const effectiveLimit = limit || 10;
    const offset = ((page || 1) - 1) * effectiveLimit;

    const { count, rows } = await db.Order.findAndCountAll({
        where: { status },
        limit: effectiveLimit,
        offset,
        order: [["id", "DESC"]],
        attributes: { exclude: ["updatedAt", "userId", "id", "deliveryAddress"] }
    });
    return {
        errCode: 0,
        data: { totalItems: count, totalPages: Math.ceil(count / effectiveLimit), currentPage: page || 1, orders: rows },
        message: "Get all order success"
    };
};

// --- GET ALL PRODUCT REPORT (The Efficient Method) ---
const getAllProductReport = async (timeStart: Date, timeEnd: Date, limit?: number, page?: number): Promise<ServiceResponse> => {
  if (!timeStart || !timeEnd) {
    return { errCode: 1, message: "Missing required time parameters!" };
  }
  const effectiveLimit = limit || 10;
  const offset = ((page || 1) - 1) * effectiveLimit;

  // ENHANCEMENT 3: This single query replaces the entire N+1 mess and in-memory filtering.
  const { count, rows } = await db.Order_History.findAndCountAll({
    limit: effectiveLimit,
    offset,
    // Filter by date directly in the database
    where: {
      createdAt: {
        [Op.between]: [timeStart, timeEnd]
      }
    },
    // Join with Order and filter for completed orders only
    include: [
      {
        model: db.Order,
        as: 'OrderData', // Ensure this alias is correct in your model
        where: { status: 3 },
        attributes: [] // We only need it for the filter
      },
      { model: db.Size, as: 'SizeOrderDetailData', attributes: ['sizeId', 'sizeName'] },
      { model: db.Product, as: 'ProductDetailData', attributes: ['name', 'price', 'discount', 'image'] }
    ]
  });

  return {
    errCode: 0,
    data: {
      totalItems: count,
      totalPages: Math.ceil(count / effectiveLimit),
      currentPage: page || 1,
      reportItems: rows,
    },
    message: "Get report success"
  };
};

export {
  createNewOrderService,
  getAllOrderService,
  getOrderDetailService,
  cancleOrderService,
  getAllOrderAdminService,
  deliveringOrderService,
  succeedOrderService,
  deleteOrderService,
  updateOrderStatus,
  getStatisticsService,
  getAllProductReport,
};
