import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";

// Use Prisma's auto-generated types
type SizeCreateInput = Prisma.SizeCreateInput;
type SizeUpdateInput = Prisma.SizeUpdateInput;

/**
 * Creates a new size. Throws an error if the sizeId is not unique,
 * or if the sizeName is not unique for the given productTypeId.
 * @param data The data for the new size.
 * @returns The newly created size.
 */
export const createSize = async (data: SizeCreateInput) => {
  if (!data.sizeId || !data.sizeName || !data.productType) {
    throw new Error("Missing required parameters: sizeId, sizeName, and productTypeId are required.");
  }

  try {
    // The @@unique constraint in the schema handles the composite key check automatically.
    // Prisma will throw a P2002 error if either unique constraint is violated.
    return prisma.size.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // We can inspect the error meta to see which constraint failed
      const target = error.meta?.target as string[];
      if (target.includes('sizeId')) {
        throw new Error("SizeId is already exist");
      }
      if (target.includes('productTypeId') && target.includes('sizeName')) {
        throw new Error(`Size Name "${data.sizeName}" already exists for this product type.`);
      }
    }
    // Re-throw other errors to be handled by the global error handler
    throw error;
  }
};

/**
 * Retrieves a paginated and filterable list of all sizes.
 */
export const getAllSizes = async (
  limit?: number,
  page?: number,
  sort?: string,
  name?: string
) => {
  const effectiveLimit = limit || 10;
  const effectivePage = page || 1;
  const skip = (effectivePage - 1) * effectiveLimit;
  
  const where: Prisma.SizeWhereInput = {};
  if (name) {
    where.sizeName = { contains: name, mode: 'insensitive' };
  }

  const [sortField, sortOrder] = sort ? sort.split(',') : ['id', 'desc'];
  
  const [totalItems, sizes] = await prisma.$transaction([
    prisma.size.count({ where }),
    prisma.size.findMany({
      where,
      take: effectiveLimit,
      skip,
      orderBy: { [sortField]: sortOrder },
      select: {
        id: true,
        sizeId: true,
        sizeName: true,
        // Include the related productType and select specific fields
        productType: {
          select: {
            productTypeId: true,
            productTypeName: true,
          }
        }
      },
    }),
  ]);

  return {
    totalItems,
    totalPages: Math.ceil(totalItems / effectiveLimit),
    currentPage: effectivePage,
    sizes,
  };
};

/**
 * Retrieves all sizes that belong to a specific product type.
 * @param productTypeId The primary key ID of the product type.
 * @returns An array of sizes.
 */
export const getAllSizesByCategory = async (productTypeId: number) => {
  if (!productTypeId) {
    throw new Error("Missing required parameter: productTypeId is required.");
  }

  return prisma.size.findMany({
    where: { productTypeId },
    select: {
      id: true,
      sizeId: true,
      sizeName: true,
    },
    orderBy: {
      sizeName: 'asc',
    },
  });
};

/**
 * Updates a size's data. Throws an error if not found or if data violates unique constraints.
 * @param id The ID of the size to update.
 * @param data The new data for the size.
 * @returns The updated size.
 */
export const updateSize = async (id: number, data: SizeUpdateInput) => {
  // Prisma's `update` handles all unique constraint checks automatically.
  // The complex pre-check query from Sequelize is no longer needed.
  return prisma.size.update({
    where: { id },
    data,
  });
};

/**
 * Deletes a size by its primary key ID. Throws an error if not found.
 * @param id The ID of the size to delete.
 */
export const deleteSize = async (id: number) => {
  // `delete` will automatically throw a catchable P2025 error if the record is not found.
  return prisma.size.delete({ where: { id } });
};
