import { prisma } from "../../lib/prisma.js";
import { v2 as cloudinary } from 'cloudinary';
import type { Prisma } from "@prisma/client";

// Use Prisma's auto-generated types
type ProductCreateInput = Prisma.ProductCreateInput;
type ProductUpdateInput = Prisma.ProductUpdateInput;

// A custom type for filter options
interface FilterOptions {
    brandId?: number[];
    price?: [number, number];
}

/**
 * Creates a new product. Throws an error if unique constraints are violated.
 * @param data The data for the new product.
 * @returns The newly created product.
 */
export const createProduct = async (data: ProductCreateInput) => {
  if (!data.productId || !data.brandId || !data.categoryId || !data.name || !data.price) {
    throw new Error("Missing required parameters!");
  }

  try {
    return await prisma.product.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const field = (error.meta?.target as string[])[0];
      throw new Error(`A product with this ${field} already exists.`);
    }
    throw error;
  }
};

/**
 * A shared helper function for getting paginated lists of products with their average ratings.
 */
export const getPaginatedProducts = async (where: Prisma.ProductWhereInput, limit = 10, page = 1, sort = "id,desc") => {
    const skip = (page - 1) * limit;
    const [sortField, sortOrder] = sort.split(',');

    const [totalItems, products] = await prisma.$transaction([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortField]: sortOrder as Prisma.SortOrder },
            include: {
                brand: { select: { brandId: true, name: true } }, // Renamed from brandName
                category: { select: { categoryId: true, name: true } }, // Renamed from productType
                feedbacks: { select: { rating: true } }
            }
        })
    ]);

    // Calculate average rating in the application. This is often simpler and fast enough.
    const productsWithAvgRating = products.map(p => {
        const totalRating = p.feedbacks.reduce((sum, f) => sum + f.rating, 0);
        const averageRating = p.feedbacks.length > 0 ? totalRating / p.feedbacks.length : 0;
        const { feedbacks, ...productData } = p; // Remove the raw feedbacks array
        return {
            ...productData,
            rating: Math.round(averageRating * 10) / 10
        };
    });

    return {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        products: productsWithAvgRating
    };
};

/**
 * Retrieves a list of all products, with pagination, sorting, and name filtering.
 */
export const getAllProducts = async (limit?: number, page?: number, sort?: string, name?: string) => {
    const where: Prisma.ProductWhereInput = {};
    if (name) {
        where.name = { contains: name, mode: 'insensitive' };
    }
    return getPaginatedProducts(where, limit, page, sort);
};

/**
 * Retrieves a filtered list of products belonging to a specific category.
 */
export const getAllProductsByCategory = async (categoryId: number, limit?: number, page?: number, sort?: string, filter?: FilterOptions) => {
    const where: Prisma.ProductWhereInput = { categoryId };
    if (filter?.brandId && filter.brandId.length > 0) {
        where.brandId = { in: filter.brandId };
    }
    if (filter?.price && filter.price.length === 2) {
        where.price = { gte: filter.price[0], lte: filter.price[1] };
    }
    return getPaginatedProducts(where, limit, page, sort);
};

/**
 * Retrieves a list of all products currently on sale.
 */
export const getAllProductsOnSale = async (limit?: number, page?: number) => {
    const where: Prisma.ProductWhereInput = { discount: { gt: 0 } };
    return getPaginatedProducts(where, limit, page);
};

/**
 * Retrieves the full details for a single product, including inventory and feedback stats.
 */
export const getProductDetails = async (productId: string) => {
  if (!productId) {
    throw new Error("Missing required productId parameter!");
  }
  
  // Step 1: Get the core product data and its direct relations
  const product = await prisma.product.findUnique({
    where: { productId },
    include: {
      brand: { select: { brandId: true, name: true } },
      category: { select: { categoryId: true, name: true } },
      inventory: {
        select: {
          quantity: true,
          sold: true,
          size: { select: { sizeId: true, name: true } }
        }
      }
    }
  });

  if (!product) {
    throw new Error("Product not found.");
  }
  
  // Step 2: Perform a separate, lightweight query to get aggregate stats
  const feedbackStats = await prisma.feedback.aggregate({
    where: { productId: product.id },
    _avg: { rating: true },
    _count: { id: true },
  });

  return {
    ...product,
    averageRating: feedbackStats._avg.rating ? Math.round(feedbackStats._avg.rating * 10) / 10 : 0,
    feedbackCount: feedbackStats._count.id
  };
};

/**
 * Retrieves a list of products a user has purchased but not yet reviewed.
 */
export const getUnreviewedProductsForUser = async (userId: number) => {
  if (!userId) {
    throw new Error("Missing required userId parameter!");
  }
  
  // Prisma's relational `where` clause makes this query simple and powerful.
  const unreviewedItems = await prisma.orderHistory.findMany({
    where: {
      statusFeedback: 0, // Not reviewed
      order: {
        userId: userId,
        status: 3, // Order was completed
      }
    },
    include: {
      size: { select: { sizeId: true, name: true } },
      product: { select: { image: true, name: true, price: true, discount: true, productId: true } }
    }
  });
  
  // Format the data to match the desired flat structure for the client
  return unreviewedItems.map(item => ({
    ...item.product,
    orderId: item.orderId,
    quantity: item.quantity,
    totalPrice: item.totalPrice,
    sizeId: item.size.sizeId,
    sizeName: item.size.name,
  }));
};

/**
 * Updates a product. Throws an error if not found or if unique constraints are violated.
 * @param id The ID of the product to update.
 * @param data The new data for the product.
 * @returns The updated product.
 */
export const updateProduct = async (id: number, data: ProductUpdateInput, newImageFile?: { path: string, filename: string }) => {
  const productToUpdate = await prisma.product.findUnique({ where: { id }});
  if (!productToUpdate) {
    throw new Error("Product not found.");
  }

  if (newImageFile && productToUpdate.imageId) {
    await cloudinary.uploader.destroy(productToUpdate.imageId);
  }

  const updateData = { ...data };
  if (newImageFile) {
      updateData.image = newImageFile.path;
      updateData.imageId = newImageFile.filename;
  }

  try {
    return await prisma.product.update({ where: { id }, data: updateData });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const field = (error.meta?.target as string[])[0];
      throw new Error(`Another product with this ${field} already exists.`);
    }
    throw error;
  }
};

/**
 * Deletes a product by its ID, also removing its image from Cloudinary.
 * @param id The ID of the product to delete.
 */
export const deleteProduct = async (id: number) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new Error("Product not found.");
  }
  if (product.imageId) {
    await cloudinary.uploader.destroy(product.imageId);
  }
  return prisma.product.delete({ where: { id } });
};

