import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";

/**
 * Adds a product to a user's favourites list.
 * Throws an error if the product is already in their favourites.
 * @param userId The ID of the user.
 * @param productId The ID of the product.
 * @returns The newly created favourite entry.
 */
export const addProductToFavourites = async (userId: number, productId: number) => {
  if (!userId || !productId) {
    throw new Error("Missing required parameters: userId and productId are required.");
  }

  // Prisma's `create` is atomic. The @@unique([userId, productId]) constraint
  // in the schema will cause a P2002 error if the entry already exists.
  try {
    return await prisma.favourite.create({
      data: { userId, productId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error("This product is already in your favourites.");
    }
    throw error;
  }
};

/**
 * Gets a paginated list of a user's favourite products with full details and average ratings.
 * @param userId The ID of the user.
 */
export const getFavouritedProducts = async (userId: number, limit = 12, page = 1) => {
  if (!userId) {
    throw new Error("Missing required userId parameter!");
  }
  
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    // Filter products that have been favourited by this user
    favouritedBy: {
        some: {
            userId: userId
        }
    }
  };

  // Run two queries in a transaction for safe pagination
  const [totalItems, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' }, // Or sort by when it was favourited
        include: {
            brand: { select: { brandId: true, name: true } },
            category: { select: { categoryId: true, name: true } },
            feedbacks: { select: { rating: true } }
        }
    })
  ]);

  // Calculate average rating in the application
  const productsWithAvgRating = products.map(p => {
    const totalRating = p.feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = p.feedbacks.length > 0 ? totalRating / p.feedbacks.length : 0;
    const { feedbacks, ...productData } = p;
    return {
        ...productData,
        rating: Math.round(averageRating * 10) / 10
    };
  });

  return {
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    products: productsWithAvgRating,
  };
};

/**
 * Gets a simple array of all product IDs favourited by a user.
 * Ideal for quick checks (e.g., "is this product favourited?").
 * @param userId The ID of the user.
 * @returns An array of numbers (product IDs).
 */
export const getFavouritedProductIds = async (userId: number) => {
  if (!userId) {
    throw new Error("Missing required user ID!");
  }

  const favourites = await prisma.favourite.findMany({
    where: { userId },
    select: { productId: true }, // Prisma's equivalent of "pluck"
  });

  return favourites.map(f => f.productId);
};

/**
 * [ADMIN] Gets a paginated list of a specific user's favourite products.
 * @param userId The ID of the user whose favourites are being requested.
 */
export const getFavouritedProductsByUser = async (userId: number, limit = 12, page = 1) => {
  if (!userId) {
    throw new Error("Missing required parameter: userId is required.");
  }
  
  const skip = (page - 1) * limit;

  // The `where` clause is the only part that's different from the user-facing function.
  const where: Prisma.ProductWhereInput = {
    favouritedBy: {
        some: {
            userId: userId // Use the userId passed as an argument
        }
    }
  };

  const [totalItems, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
            brand: { select: { name: true } },
            category: { select: { name: true } },
            feedbacks: { select: { rating: true } }
        }
    })
  ]);

  // Calculate average rating
  const productsWithAvgRating = products.map(p => {
    const totalRating = p.feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = p.feedbacks.length > 0 ? totalRating / p.feedbacks.length : 0;
    const { feedbacks, ...productData } = p;
    return {
        ...productData,
        rating: Math.round(averageRating * 10) / 10
    };
  });

  return {
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    products: productsWithAvgRating,
  };
};

/**
 * Removes a product from a user's favourites list.
 * Throws an error if the favourite entry is not found.
 * @param userId The ID of the user.
 * @param productId The ID of the product.
 */
export const removeProductFromFavourites = async (userId: number, productId: number) => {
  if (!userId || !productId) {
    throw new Error("Missing required parameters: userId and productId are required.");
  }

  // Use the composite unique key to identify the record to delete.
  // `delete` will throw a P2025 error if the record is not found.
  return prisma.favourite.delete({
    where: {
      unique_user_product_favourite_constraint: {
        userId,
        productId,
      },
    },
  });
};
