import { prisma } from "../../lib/prisma.js"; // Import your singleton Prisma Client
import type { Prisma } from "@prisma/client";
import type { ServiceResponse } from "../../types/serviceResponse.js";

type BrandCreateInput = Prisma.BrandCreateInput;
type BrandUpdateInput = Prisma.BrandUpdateInput;

/**
 * Creates a new brand. Throws an error if the brandId or brandName already exist.
 * @param data The data for the new brand.
 * @returns The newly created brand.
 */
export const createBrand = async (data: BrandCreateInput) => {
  if (!data.brandId || !data.brandName) {
    throw new Error("Missing required parameters: brandId and brandName are required.");
  }
  
  // You can still perform an upfront check for a friendlier error message if you wish
  const existingBrand = await prisma.brand.findFirst({
      where: { OR: [{ brandId: data.brandId }, { brandName: data.brandName }] }
  });
  if (existingBrand) {
      const message = existingBrand.brandId === data.brandId ? "BrandId already exists" : "BrandName already exists";
      throw new Error(message); // Throw an error instead of returning an object
  }

  return prisma.brand.create({ data });
};

/**
 * Retrieves all brands or a paginated list of brands.
 * Can be filtered by name and sorted.
 */
export const getAllBrands = async (
  limit?: number,
  page?: number,
  sort?: string,
  name?: string,
  pagination = true
) => {
  if (!pagination) {
    return prisma.brand.findMany({
      select: { id: true, brandId: true, brandName: true },
    });
  }

  const effectiveLimit = limit || 10;
  const effectivePage = page || 1;
  const skip = (effectivePage - 1) * effectiveLimit;
  
  const where: Prisma.BrandWhereInput = {};
  if (name) {
    where.brandName = { contains: name, mode: 'insensitive' };
  }

  const [sortField, sortOrder] = sort ? sort.split(',') : ['id', 'desc'];
  
  const [totalItems, brands] = await prisma.$transaction([
    prisma.brand.count({ where }),
    prisma.brand.findMany({
      where,
      take: effectiveLimit,
      skip,
      orderBy: { [sortField]: sortOrder },
      select: { id: true, brandId: true, brandName: true },
    }),
  ]);

  return {
    totalItems,
    totalPages: Math.ceil(totalItems / effectiveLimit),
    currentPage: effectivePage,
    brands,
  };
};

/**
 * Updates a brand's data. Throws an error if the brand is not found
 * or if the new data violates a unique constraint.
 * @param id The ID of the brand to update.
 * @param data The new data for the brand.
 * @returns The updated brand.
 */
export const updateBrand = async (id: number, data: BrandUpdateInput) => {
  return prisma.brand.update({
    where: { id },
    data,
  });
};

/**
 * Deletes a brand by its primary key ID. Throws an error if the brand is not found.
 * @param id The ID of the brand to delete.
 */
export const deleteBrand = async (id: number) => {
  // `delete` will throw a P2025 error if the record doesn't exist,
  // which can be caught by a central error handler.
  return prisma.brand.delete({ where: { id } });
};
