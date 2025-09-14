import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";

// Use Prisma's auto-generated types
// Note: We use the Prisma model name `ProductSize` here, even if we call the feature "Inventory".
type InventoryCreateInput = Prisma.ProductSizeCreateInput;
type InventoryUpdateInput = Prisma.ProductSizeUpdateInput;

/**
 * Creates a new inventory entry for a specific product and size.
 * Throws an error if an entry for this combination already exists.
 * @param data The data for the new inventory entry.
 * @returns The newly created inventory entry.
 */
export const createInventoryEntry = async (data: InventoryCreateInput) => {
  const { productId, sizeId, quantity } = data;
  if (productId == null || sizeId == null || quantity == null) {
    throw new Error("Missing required parameters: productId, sizeId, and quantity are required.");
  }

  // Prisma's `create` is atomic. The @@unique constraint in the schema
  // will cause Prisma to throw a P2002 error if the entry already exists.
  // This is safer and simpler than Sequelize's `findOrCreate`.
  try {
    return await prisma.productSize.create({
      data: {
        productId,
        sizeId,
        quantity,
        sold: 0, // Always initialize sold count to 0
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error("This product and size combination already has an inventory entry.");
    }
    throw error;
  }
};

/**
 * Retrieves a paginated list of all inventory entries for a specific product.
 * @param productId The primary key ID of the product.
 */
export const getInventoryForProduct = async (
  productId: number,
  limit?: number,
  page?: number,
  sort?: string
) => {
  if (!productId) {
    throw new Error("Missing required parameter: productId is required.");
  }

  const effectiveLimit = limit || 10;
  const effectivePage = page || 1;
  const skip = (effectivePage - 1) * effectiveLimit;
  
  const where: Prisma.ProductSizeWhereInput = { productId };
  const [sortField, sortOrder] = sort ? sort.split(',') : ['id', 'desc'];

  const [totalItems, inventoryEntries] = await prisma.$transaction([
    prisma.productSize.count({ where }),
    prisma.productSize.findMany({
      where,
      take: effectiveLimit,
      skip,
      orderBy: { [sortField]: sortOrder },
      select: {
        id: true,
        quantity: true,
        sold: true,
        // Include related data with specific fields
        product: {
          select: { productId: true, name: true }
        },
        size: {
          select: { sizeId: true, name: true } // Renamed from sizeName
        }
      }
    }),
  ]);

  return {
    totalItems,
    totalPages: Math.ceil(totalItems / effectiveLimit),
    currentPage: effectivePage,
    inventory: inventoryEntries, // Use the clearer name in the response
  };
};

/**
 * Updates an inventory entry. Throws an error if not found or if the new
 * productId/sizeId combination conflicts with an existing entry.
 * @param id The ID of the inventory entry to update.
 * @param data The new data for the entry.
 * @returns The updated inventory entry.
 */
export const updateInventoryEntry = async (id: number, data: InventoryUpdateInput) => {
  // The complex `[Op.ne]` check from Sequelize is no longer needed.
  // Prisma's `update` automatically handles all unique constraint checks.
  try {
    return await prisma.productSize.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error("Another inventory entry for this product and size already exists.");
    }
    throw error;
  }
};

/**
 * Deletes an inventory entry by its primary key ID.
 * @param id The ID of the inventory entry to delete.
 */
export const deleteInventoryEntry = async (id: number) => {
  // `delete` will automatically throw a catchable P2025 error if the record is not found.
  return prisma.productSize.delete({ where: { id } });
};
