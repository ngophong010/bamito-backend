import { prisma } from "../../lib/prisma.js";
import { v4 as uuidv4 } from "uuid";
import type { Prisma } from "@prisma/client";

// Use a specific, clear interface for the input data
interface CartItemInput {
  userId: number;
  productId: number;
  sizeId: number;
  quantity: number;
  // We no longer need totalPrice, as the service will calculate it.
}

/**
 * Adds an item to a user's cart. If the item (product/size combo) already exists,
 * it updates the quantity. If the user has no cart, one is created automatically.
 * This is a transactional operation.
 * @param data The data for the cart item.
 * @returns The created or updated cart detail entry.
 */
export const addOrUpdateCartItem = async (data: CartItemInput) => {
  const { userId, productId, sizeId, quantity } = data;
  if (userId == null || productId == null || sizeId == null || quantity == null) {
    throw new Error("Missing required parameters!");
  }

  return prisma.$transaction(async (tx) => {
    // Step 1: Find or create the user's cart header
    const cart = await tx.cart.upsert({
      where: { userId },
      create: { userId, cartId: uuidv4().slice(-10) },
      update: {}, // No update needed if it exists
    });

    // Step 2: Get product price to calculate total price
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new Error("Product not found.");
    }
    const itemTotalPrice = (product.price - (product.price * (product.discount || 0) / 100)) * quantity;


    // Step 3: Upsert the cart detail item
    return await tx.cartDetail.upsert({
      where: {
        // Use the composite unique key from the schema
        unique_cart_product_size_constraint: {
          cartId: cart.id,
          productId,
          sizeId,
        },
      },
      // If it exists, update the quantity and price
      update: {
        quantity: quantity,
        totalPrice: itemTotalPrice,
      },
      // If it's new, create it
      create: {
        cartId: cart.id,
        productId,
        sizeId,
        quantity,
        totalPrice: itemTotalPrice,
      },
    });
  });
};

/**
 * Retrieves all items in a user's cart with full product and stock details.
 * @param userId The ID of the user.
 * @returns An object containing the formatted list of products and the total count.
 */
export const getCartContents = async (userId: number) => {
  if (!userId) {
    throw new Error("Missing required user ID!");
  }

  const cartDetails = await prisma.cartDetail.findMany({
    where: { cart: { userId } },
    orderBy: { createdAt: 'desc' },
    include: {
      // Prisma's `include` lets us fetch all related data in one go
      product: {
        include: {
          category: { select: { name: true } },
          // We need to fetch the specific inventory entry for this product and size
          inventory: {
            where: {
              // This is a powerful relational filter
              size: { id: { equals: prisma.cartDetail.fields.sizeId } }
            },
            select: { quantity: true }
          }
        }
      },
      size: { select: { sizeId: true, name: true } },
    }
  });

  if (!cartDetails || cartDetails.length === 0) {
    return { products: [], totalProduct: 0 };
  }

  // Format the data into the clean structure your client expects
  const formattedProducts = cartDetails.map(detail => {
    // Find the specific inventory entry for the item's size
    const stock = detail.product.inventory.find(inv => inv.sizeId === detail.sizeId);

    return {
      productId: detail.product.productId,
      categoryName: detail.product.category.name,
      name: detail.product.name,
      image: detail.product.image,
      sizeId: detail.size.sizeId,
      sizeName: detail.size.name,
      price: detail.product.price,
      discount: detail.product.discount,
      quantity: detail.quantity, // User's desired quantity
      totalPrice: detail.totalPrice,
      stockQuantity: stock ? stock.quantity : 0, // Available stock for that size
    };
  });
  
  // Note: The above mapping can be complex. An alternative is a more direct but less type-safe raw query.
  // For most cases, mapping the `include` result is preferred for type safety.

  return {
    products: formattedProducts,
    totalProduct: formattedProducts.length,
  };
};

/**
 * Removes a specific item (product/size combo) from a user's cart.
 * @param userId The ID of the user.
 * @param productId The ID of the product to remove.
 * @param sizeId The ID of the size to remove.
 */
export const removeCartItem = async (userId: number, productId: number, sizeId: number) => {
  if (userId == null || productId == null || sizeId == null) {
    throw new Error("Missing required parameters!");
  }

  // To delete a CartDetail, we must first find its parent Cart to get the cartId.
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    // If the user has no cart, the item can't exist, so the operation is successful.
    return;
  }

  // `delete` will throw a P2025 error if the item is not found in the cart.
  return prisma.cartDetail.delete({
    where: {
      unique_cart_product_size_constraint: {
        cartId: cart.id,
        productId,
        sizeId,
      },
    },
  });
};
