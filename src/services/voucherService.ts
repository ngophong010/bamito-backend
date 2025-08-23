import db from "../models/index.js";
import { Op } from "sequelize";
import type { ServiceResponse } from "../types/serviceResponse.js";
import { v2 as cloudinary } from 'cloudinary';

// Define the shape of the voucher data for type safety
interface VoucherData {
  id?: number;
  voucherId: string;
  voucherPrice: number;
  quantity: number;
  timeStart: Date;
  timeEnd: Date;
  imageUrl?: string;
  imageId?: string;
}

// --- CREATE ---
const createNewVoucherService = async (data: VoucherData): Promise<ServiceResponse> => {
  const { voucherId, voucherPrice, quantity, timeStart, timeEnd, imageUrl, imageId } = data;
  if (!voucherId || voucherPrice == null || quantity == null || !timeStart || !timeEnd) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  // ENHANCEMENT: Use `findOrCreate` for an atomic operation to prevent race conditions.
  const [voucher, created] = await db.Voucher.findOrCreate({
    where: { voucherId },
    defaults: { voucherId, voucherPrice, quantity, timeStart, timeEnd, image: imageUrl, imageId },
  });

  if (created) {
    return { errCode: 0, message: "Voucher created successfully." };
  } else {
    return { errCode: 2, message: "A voucher with this ID already exists." };
  }
};

// --- DELETE ---
const deleteVoucherService = async (id: number): Promise<ServiceResponse> => {
  const voucher = await db.Voucher.findByPk(id);
  if (!voucher) {
    return { errCode: 2, message: "Voucher not found." };
  }

  if (voucher.imageId) {
    await cloudinary.uploader.destroy(voucher.imageId);
  }

  await voucher.destroy();
  return { errCode: 0, message: "Voucher deleted successfully." };
};

// --- UPDATE ---
const updateVoucherService = async (data: VoucherData): Promise<ServiceResponse> => {
  const { id, voucherId } = data;
  if (!id || !voucherId) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  const voucherToUpdate = await db.Voucher.findByPk(id);
  if (!voucherToUpdate) {
    return { errCode: 3, message: "Voucher not found." };
  }

  // ENHANCEMENT: Efficiently and correctly check for duplicates
  const existingVoucher = await db.Voucher.findOne({
    where: { voucherId, id: { [Op.ne]: id } },
  });

  if (existingVoucher) {
    return { errCode: 2, message: "Another voucher with this ID already exists." };
  }

  // If a new image is uploaded, destroy the old one first
  if (data.imageUrl && data.imageId && voucherToUpdate.imageId) {
    await cloudinary.uploader.destroy(voucherToUpdate.imageId);
  }

  await voucherToUpdate.update(data);
  return { errCode: 0, message: "Voucher updated successfully." };
};

// --- READ (GET ALL - PAGINATED FOR ADMIN) ---
const getAllVoucherService = async (
  limit?: number,
  page?: number,
  sort?: string,
  name?: string,
  pagination: boolean = true
): Promise<ServiceResponse> => {
  if (pagination) {
    const effectiveLimit = limit || 10;
    const offset = ((page || 1) - 1) * effectiveLimit;
    const whereClause: { voucherId?: any } = {};
    if (name) {
      whereClause.voucherId = { [Op.substring]: name };
    }

    const { count, rows } = await db.Voucher.findAndCountAll({
      where: whereClause,
      limit: effectiveLimit,
      offset,
      order: [sort ? sort.split(',') : ['id', 'DESC']],
      attributes: { exclude: ["createdAt", "updatedAt", "imageId"] },
    });
    return {
      errCode: 0,
      data: { totalItems: count, totalPages: Math.ceil(count / effectiveLimit), currentPage: page || 1, vouchers: rows },
      message: "This is voucher page 1"
    };
  } else {
    const vouchers = await db.Voucher.findAll({ attributes: { exclude: ["createdAt", "updatedAt", "imageId"] } });
    return { errCode: 0, data: vouchers, message: "All voucher available" };
  }
};

// --- READ (GET ALL ACTIVE VOUCHERS FOR USERS) ---
const getAllVoucherUserService = async (): Promise<ServiceResponse> => {
  // ENHANCEMENT: Let the database do all the filtering work. This is vastly more efficient.
  const vouchers = await db.Voucher.findAll({
    where: {
      timeStart: { [Op.lte]: new Date() }, // Starts on or before today
      timeEnd: { [Op.gte]: new Date() },   // Ends on or after today
      quantity: { [Op.gt]: 0 },           // Quantity must be greater than 0
    },
    attributes: { exclude: ["createdAt", "updatedAt", "imageId"] },
  });
  return { errCode: 0, data: vouchers, message: "All voucher actively now" };
};

export {
  createNewVoucherService,
  deleteVoucherService,
  updateVoucherService,
  getAllVoucherService,
  getAllVoucherUserService,
};
