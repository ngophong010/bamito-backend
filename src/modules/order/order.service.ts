import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";

// --- Custom Types for Clarity ---
interface OrderCreateInput {
  userId: number;
  payment: string;
  deliveryAddress: string;
  voucherId?: number;
  cartItems: {
    productId: number;
    sizeId: number;
    quantity: number;
  }[]; // We will calculate price on the backend for security
}

interface OrderCancelInput {
  orderId: number;
  // We can fetch the order items from the DB, making the input simpler
}

// ===============================================================
// --- CORE ORDER WORKFLOWS (Transactional) ---
// ===============================================================

export const createOrder = async (data: OrderCreateInput) => {
  const { userId, payment, deliveryAddress, voucherId, cartItems } = data;
  if (!userId || !payment || !deliveryAddress || !cartItems || cartItems.length === 0) {
    throw new Error("Missing required parameters!");
  }

  return prisma.$transaction(async (tx) => {
    // Step 1: Fetch all product and size data in a single query for efficiency and snapshots
    const productIds = cartItems.map(item => item.productId);
    const sizeIds = cartItems.map(item => item.sizeId);

    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    const sizes = await tx.size.findMany({ where: { id: { in: sizeIds } } });

    // Step 2: Calculate total price and create snapshot data on the backend
    let totalPrice = 0;
    const orderItemsData = cartItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      const size = sizes.find(s => s.id === item.sizeId);
      if (!product || !size) throw new Error(`Product or Size not found for item: ${item.productId}/${item.sizeId}`);

      const itemPrice = product.price * (1 - (product.discount || 0) / 100);
      const itemTotalPrice = itemPrice * item.quantity;
      totalPrice += itemTotalPrice;

      return {
        productId: item.productId,
        sizeId: item.sizeId,
        quantity: item.quantity,
        price: itemPrice, // Snapshot of the price per item
        productName: product.name, // Snapshot of the product name
        productImage: product.image || '', // Snapshot of the product image
        sizeName: size.name, // Snapshot of the size name
      };
    });

    // Step 3: Create the Order header
    const order = await tx.order.create({
      data: {
        orderId: uuidv4().slice(-10).toUpperCase(),
        userId,
        voucherId,
        totalPrice,
        payment,
        deliveryAddress,
        status: 1, // Assuming 1 = Pending/Confirmed
      },
    });

    // Step 4: Create the OrderItem records with the snapshot data
    await tx.orderItem.createMany({
      data: orderItemsData.map(item => ({ ...item, orderId: order.id })),
    });

    // Step 5: Decrement inventory for each item
    for (const item of cartItems) {
      await tx.productSize.update({
        where: { unique_product_size_constraint: { productId: item.productId, sizeId: item.sizeId } },
        data: { quantity: { decrement: item.quantity }, sold: { increment: item.quantity } },
      });
    }

    // Step 6: Clear the user's cart
    await tx.cartDetail.deleteMany({ where: { cart: { userId: userId } } });

    return order;
  });
};

export const cancelOrder = async (orderId: number) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true }, // Fetch the items to restore inventory
    });

    if (!order) throw new Error("Order not found.");
    if (order.status !== 1) throw new Error("Only pending orders can be cancelled."); // Business rule

    // Step 1: Update the order's status
    await tx.order.update({
      where: { id: orderId },
      data: { status: 0 }, // 0 = Cancelled
    });

    // Step 2: Restore inventory for each item
    for (const item of order.items) {
      await tx.productSize.update({
        where: { unique_product_size_constraint: { productId: item.productId, sizeId: item.sizeId } },
        data: { quantity: { increment: item.quantity }, sold: { decrement: item.quantity } },
      });
    }
  });
};

// ===============================================================
// --- STATUS UPDATES & DELETION ---
// ===============================================================

export const updateOrderStatus = async (orderId: number, status: number) => {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};

export const deleteOrder = async (orderId: number) => {
  // Soft delete by updating status to a "deleted" state, e.g., -1
  return updateOrderStatus(orderId, -1);
};


// ===============================================================
// --- READ QUERIES ---
// ===============================================================

export const getOrderDetail = async (orderId: number) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { userName: true, phoneNumber: true } },
      voucher: { select: { voucherId: true, voucherPrice: true } },
      items: {
        include: {
          size: { select: { sizeId: true, name: true } },
          product: { select: { productId: true, image: true, name: true, price: true, discount: true } },
        },
      },
    },
  });

  if (!order) throw new Error("Order not found.");
  return order;
};

export const getAllOrders = async (status: number, limit = 10, page = 1, userId?: number) => {
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = { status };
    if (userId) {
        where.userId = userId;
    }

    const [totalItems, orders] = await prisma.$transaction([
        prisma.order.count({ where }),
        prisma.order.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            select: { id: true, orderId: true, totalPrice: true, payment: true, status: true, createdAt: true, user: { select: { userName: true }} }
        })
    ]);

    return { totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page, orders };
};

export const getAllOrdersForUser = (userId: number, status: number, limit?: number, page?: number) =>
    getAllOrders(status, limit, page, userId);
export const getAllOrdersForAdmin = (status: number, limit?: number, page?: number) =>
    getAllOrders(status, limit, page);


// ===============================================================
// --- REPORTING & STATISTICS ---
// ===============================================================

export const getStatistics = async () => {
  const [
    incomeResult,
    totalOrder,
    totalProduct,
    statusCounts,
  ] = await prisma.$transaction([
    prisma.order.aggregate({ _sum: { totalPrice: true }, where: { status: 3 } }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
  ]);

  const getStatusCount = (status: number) => statusCounts.find(s => s.status === status)?._count.status || 0;

  return {
    totalIncome: incomeResult._sum.totalPrice || 0,
    totalOrder,
    totalProduct,
    allTotalOrder: [
      { label: "Xác nhận", quantity: getStatusCount(1) },
      { label: "Đang giao", quantity: getStatusCount(2) },
      { label: "Hoàn tất", quantity: getStatusCount(3) },
      { label: "Đã hủy", quantity: getStatusCount(0) },
    ],
  };
};

export const getSalesReport = async (timeStart: Date, timeEnd: Date, limit = 10, page = 1) => {
  const skip = (page - 1) * limit;

  const where: Prisma.OrderItemWhereInput = {
      createdAt: { gte: timeStart, lte: timeEnd },
      order: { status: 3 } // Completed orders only
  };

  const [totalItems, reportItems] = await prisma.$transaction([
      prisma.orderItem.count({ where }),
      prisma.orderItem.findMany({
          where,
          skip,
          take: limit,
          select: {
            // Select snapshot data directly from the OrderItem
            productName: true,
            productImage: true,
            sizeName: true,
            quantity: true,
            price: true,
            order: { select: { orderId: true, createdAt: true } }
          }
      })
  ]);

  return { totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page, reportItems, };
};
