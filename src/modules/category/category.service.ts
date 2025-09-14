import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";

// Use Prisma's auto-generated types
type CategoryCreateInput = Prisma.CategoryCreateInput;
type CategoryUpdateInput = Prisma.CategoryUpdateInput;

/**
 * Creates a new category. Throws an error if the categoryId or name already exist.
 * @param data The data for the new category.
 * @returns The newly created category.
 */
export const createCategory = async (data: CategoryCreateInput) => {
  if (!data.categoryId || !data.name) {
    throw new Error("Missing required parameters: categoryId and name are required.");
  }

  // Prisma's `create` is atomic and will throw a P2002 error if any unique constraint is violated.
  // This is simpler and safer than Sequelize's `findOrCreate`.
  try {
    return await prisma.category.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const field = (error.meta?.target as string[])[0];
      throw new Error(`A category with this ${field} already exists.`);
    }
    throw error;
  }
};

/**
 * Retrieves all categories, with optional pagination for admin panels.
 */
export const getAllCategories = async (
  limit?: number,
  page?: number,
  sort?: string,
  name?: string,
  pagination = true
) => {
  if (!pagination) {
    return prisma.category.findMany({
      select: { id: true, categoryId: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  const effectiveLimit = limit || 10;
  const effectivePage = page || 1;
  const skip = (effectivePage - 1) * effectiveLimit;
  
  const where: Prisma.CategoryWhereInput = {};
  if (name) {
    where.name = { contains: name, mode: 'insensitive' };
  }

  const [sortField, sortOrder] = sort ? sort.split(',') : ['id', 'desc'];
  
  const [totalItems, categories] = await prisma.$transaction([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      take: effectiveLimit,
      skip,
      orderBy: { [sortField]: sortOrder },
      select: { id: true, categoryId: true, name: true },
    }),
  ]);

  return {
    totalItems,
    totalPages: Math.ceil(totalItems / effectiveLimit),
    currentPage: effectivePage,
    categories,
  };
};

/**
 * Retrieves a single category by its unique categoryId.
 * @param categoryId The business-logic ID of the category.
 * @returns The category object or null if not found.
 */
export const getCategoryById = async (categoryId: string) => {
  if (!categoryId) {
    throw new Error("Missing required parameter: categoryId is required.");
  }
  return prisma.category.findUnique({
    where: { categoryId },
    select: { categoryId: true, name: true },
  });
};

/**
 * Updates a category's data. Throws an error if not found or if data violates unique constraints.
 * @param id The ID of the category to update.
 * @param data The new data for the category.
 * @returns The updated category.
 */
export const updateCategory = async (id: number, data: CategoryUpdateInput) => {
  // The complex `[Op.or]` and `[Op.ne]` pre-check from Sequelize is no longer needed.
  // Prisma's `update` automatically handles all unique constraint checks.
  return prisma.category.update({
    where: { id },
    data,
  });
};

export const deleteCategory = async (id: number) => {
  // `onDelete: Cascade` in your schema for Product and Size will handle deleting related items.
  // Prisma's `delete` will throw a catchable P2025 error if the record is not found.
  return prisma.category.delete({ where: { id } });
};

