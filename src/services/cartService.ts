import { v4 as uuidv4 } from "uuid";
import db from "../models/index.js";
import { Sequelize, Op } from "sequelize";

import type { ServiceResponse } from "../types/serviceResponse.js";
import type { EnrichedCart } from "../types/shared.js"

import size from "../models/size.js";

interface CartItemData {
  userId: number;
  productId: number;
  sizeId: number;
  quantity: number;
  totalPrice: number;
}

// --- CART & ITEM MANAGEMENT ---

// This single function handles creating a cart if it doesn't exist, OR adding/updating an item.
const addOrUpdateCartItemService = async (data: CartItemData): Promise<ServiceResponse> => {
  const { userId, productId, sizeId, quantity, totalPrice} = data;

  if (!userId || !productId || !sizeId || quantity == null || totalPrice == null ) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  // Use findOrCreate for an atomic "get or create" operation. This prevents race conditions.
  const [cart] = await db.Cart.findOrCreate({
    where: { userId },
    defaults: { userId, cartId: uuidv4().slice(-10) }
  });

  // use findOrCreate again for the CartDetail item.
  const [cartDetail, created] = await db.Cart_Detail.findOrCreate({
    where: {
      cartId: cart.id,
      productId,
      sizeId,
    },
    defaults: {
      cartId: cart.id,
      productId,
      sizeId,
      quantity,
      totalPrice,
    },
  })

  if (created) {
    return { errCode: 0, message: "Product added to cart successfully." };
  } else {
    // If the item already existed, update its quantity and price.
    cartDetail.quantity = quantity;
    cartDetail.totalPrice = totalPrice;
    await cartDetail.save();
    return { errCode: 0, message: "Cart product updated successfully." };
  }
}

const deleteProductCartService = async(userId: number, productId: number, sizeId: number): Promise<ServiceResponse> => {
  if (!userId || !productId || !sizeId) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  // Find the user's cart first
  const cart = await db.Cart.findOne({ where: { userId } });
  if (!cart) {
    return { errCode: 2, message: "User cart not found." };
  }
  
  // Use a single `destroy` call with a where clause. No need to find it first.
  const deletedRows = await db.Cart_Detail.destroy({
    where: {
      cartId: cart.id,
      productId,
      sizeId,
    },
  });

  if (deletedRows > 0) {
    return { errCode: 0, message: "Product removed from cart successfully." };
  } else {
    return { errCode: 3, message: "Product not found in cart." };
  }
};

// --- READ (GET ALL CART ITEMS) ---
const getAllProductCartService = async(userId: number): Promise<ServiceResponse> => {
  if (!userId) {
    return { errCode: 1, message: "Missing required user ID!" };
  }

  const cart = await db.Cart.findOne({
    where: { userId },
    include: [{
      model: db.Cart_Detail,
      as: "cartDetails",
      include: [
        {
          model: db.Product,
          as: "productData",
          attributes: ["productId", "name", "image", "price", "discount"],
          include: [{
              model: db.ProductType,
              as: "productTypeData",
              attributes: ["productTypeName"]
          }]
        },
        { model: db.Size, as: "sizeData", attributes: ["sizeId", "sizeName"] },
        { model: db.ProductSize, as: "stockData", attributes: ["quantity"] }
      ]
    }],
    order: [[{ model: db.Cart_Detail, as: 'cartDetails' }, 'createdAt', 'DESC']]
  }) as EnrichedCart | null; // <-- THE TYPE ASSERTION

  if (!cart) {
    return { errCode: 0, data: { products: [], totalProduct: 0 }, message: "Cart is empty" };
  }

  const formattedProducts = cart.cartDetails.map(detail => ({
    productId: detail.productData.productId,
    productTypeName: detail.productData.productTypeData.productTypeName, 
    name: detail.productData.name,
    image: detail.productData.image,
    sizeId: detail.sizeData.sizeId,
    sizeName: detail.sizeData.sizeName,
    price: detail.productData.price,
    discount: detail.productData.discount,
    quantity: detail.quantity,
    totalPrice: detail.totalPrice,
    quantitySize: detail.stockData?.quantity || 0,
  }));

  return {
    errCode: 0,
    data: {
      products: formattedProducts,
      totalProduct: formattedProducts.length,
    },
    message: "Update success"
  };
};

export {
  addOrUpdateCartItemService,
  getAllProductCartService,
  deleteProductCartService,
};
