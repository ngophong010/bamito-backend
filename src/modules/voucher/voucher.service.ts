import { prisma } from "../../lib/prisma.js";
import { v2 as cloudinary } from 'cloudinary';
import type { Prisma } from "@prisma/client";

// Use Prisma's auto-generated types
type VoucherCreateInput = Prisma.VoucherCreateInput;
type VoucherUpdateInput = Prisma.VoucherUpdateInput;

/**
 * Creates a new voucher. Throws an error if the voucherId already exists.
 * @param data The data for the new voucher.
 * @returns The newly created voucher.
 */
export const createVoucher = async (data: VoucherCreateInput) => {
  if (!data.voucherId || data.voucherPrice == null || data.quantity == null || !data.timeStart || !data.timeEnd) {
    throw new Error("Missing required parameters!");
  }

  // Prisma's `create` is atomic and will throw a P2002 error if the unique `voucherId` exists.
  // This is simpler and safer than Sequelize's `findOrCreate`.
  try {
    return await prisma.voucher.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error("A voucher with this ID already exists.");
    }
    throw error;
  }
};

/**
 * Retrieves a list of all vouchers. Can be paginated for admin use.
 */
export const getAllVouchers = async (
  limit?: number,
  page?: number,
  sort?: string,
  name?: string,
  pagination = true
) => {
  if (!pagination) {
    return prisma.voucher.findMany({
      select: { id: true, voucherId: true, voucherPrice: true, quantity: true, timeStart: true, timeEnd: true, image: true },
    });
  }

  const effectiveLimit = limit || 10;
  const effectivePage = page || 1;
  const skip = (effectivePage - 1) * effectiveLimit;
  
  const where: Prisma.VoucherWhereInput = {};
  if (name) {
    where.voucherId = { contains: name, mode: 'insensitive' };
  }

  const [sortField, sortOrder] = sort ? sort.split(',') : ['id', 'desc'];
  
  const [totalItems, vouchers] = await prisma.$transaction([
    prisma.voucher.count({ where }),
    prisma.voucher.findMany({
      where,
      take: effectiveLimit,
      skip,
      orderBy: { [sortField]: sortOrder },
      select: { id: true, voucherId: true, voucherPrice: true, quantity: true, timeStart: true, timeEnd: true, image: true },
    }),
  ]);

  return {
    totalItems,
    totalPages: Math.ceil(totalItems / effectiveLimit),
    currentPage: effectivePage,
    vouchers,
  };
};

/**
 * Retrieves all currently active vouchers for end-users.
 * An active voucher is within its date range and has a quantity greater than 0.
 * @returns An array of active vouchers.
 */
export const getActiveVouchersForUser = async () => {
  const now = new Date();
  
  return prisma.voucher.findMany({
    where: {
      timeStart: { lte: now }, // lte = less than or equal to
      timeEnd:   { gte: now }, // gte = greater than or equal to
      quantity:  { gt: 0 },   // gt = greater than
    },
    select: { id: true, voucherId: true, voucherPrice: true, quantity: true, timeStart: true, timeEnd: true, image: true },
  });
};

/**
 * Updates a voucher's data. Throws an error if not found or if the new voucherId conflicts.
 * @param id The ID of the voucher to update.
 * @param data The new data for the voucher.
 * @returns The updated voucher.
 */
export const updateVoucher = async (id: number, data: VoucherUpdateInput) => {
  // First, find the current voucher state to manage its image.
  const voucherToUpdate = await prisma.voucher.findUnique({ where: { id } });
  if (!voucherToUpdate) {
    throw new Error("Voucher not found.");
  }

  // If a new image is being uploaded (identified by a new imageId), delete the old one.
  if (typeof data.imageId === 'string' && voucherToUpdate.imageId) {
    await cloudinary.uploader.destroy(voucherToUpdate.imageId);
  }

  // Prisma's `update` automatically handles unique constraint checks.
  // The complex `[Op.ne]` check from Sequelize is no longer needed.
  try {
    return await prisma.voucher.update({ where: { id }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error("Another voucher with this ID already exists.");
    }
    throw error;
  }
};

/**
 * Deletes a voucher by its primary key ID. Also deletes the associated image from Cloudinary.
 * @param id The ID of the voucher to delete.
 */
export const deleteVoucher = async (id: number) => {
  // We must first find the voucher to get its imageId for deletion from Cloudinary.
  const voucher = await prisma.voucher.findUnique({ where: { id } });

  if (!voucher) {
    throw new Error("Voucher not found."); // Or let the delete operation throw P2025
  }

  // If there's an image, destroy it on Cloudinary first.
  if (voucher.imageId) {
    await cloudinary.uploader.destroy(voucher.imageId);
  }

  // Now delete the voucher record from the database.
  return prisma.voucher.delete({ where: { id } });
};
