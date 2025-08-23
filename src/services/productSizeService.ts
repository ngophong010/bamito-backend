import db from "../models/index.js";
import { Op } from "sequelize";
import type { ServiceResponse } from "../types/serviceResponse.js";

interface ProductSizeData {
  id?: number;
  productId: number; // Foreign keys are numbers
  sizeId: number;    // Foreign keys are numbers
  quantity: number;
}

// --- CREATE ---
const createNewProductSizeService = async (data: ProductSizeData): Promise<ServiceResponse> => {
  const { productId, sizeId, quantity } = data;
  if (productId == null || sizeId == null || quantity == null) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  // ENHANCEMENT 2: Use `findOrCreate` for an atomic operation to prevent race conditions.
  const [productSize, created] = await db.ProductSize.findOrCreate({
    where: { productId, sizeId },
    defaults: { productId, sizeId, quantity, sold: 0 },
  });

  if (created) {
    return { errCode: 0, message: "Product size and inventory created successfully." };
  } else {
    // If it already existed, we can treat it as a duplicate error.
    return { errCode: 2, message: "This product size already exists." };
  }
};

// --- DELETE ---
const deleteProductSizeService = async (id: number): Promise<ServiceResponse> => {
  if (!id) {
    return { errCode: 1, message: "Missing required ID parameter!" };
  }
  const deletedRowCount = await db.ProductSize.destroy({ where: { id } });

  if (deletedRowCount === 0) {
    return { errCode: 2, message: "Product size entry not found." };
  }
  return { errCode: 0, message: "Product size deleted successfully." };
};

// --- UPDATE ---
const updateProductSizeService = async (data: ProductSizeData): Promise<ServiceResponse> => {
  const { id, productId, sizeId, quantity } = data;
  if (!id || productId == null || sizeId == null || quantity == null) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  const productSizeToUpdate = await db.ProductSize.findByPk(id);
  if (!productSizeToUpdate) {
    return { errCode: 3, message: "Product size entry not found." };
  }

  // ENHANCEMENT 1 & 3: Efficiently and correctly check for duplicates.
  const existingEntry = await db.ProductSize.findOne({
    where: {
      productId,
      sizeId,
      id: { [Op.ne]: id }, // Exclude the current entry from the check
    },
  });

  if (existingEntry) {
    return { errCode: 2, message: "Another entry for this product and size already exists." };
  }

  await productSizeToUpdate.update({ productId, sizeId, quantity });
  return { errCode: 0, message: "Product size updated successfully." };
};

// --- READ (GET ALL SIZES FOR A PRODUCT - PAGINATED) ---
const getAllProductSizeService = async (
  productId: number,
  limit?: number,
  page?: number,
  sort?: string,
): Promise<ServiceResponse> => {
  if (!productId) {
    return { errCode: 1, message: "Missing required product ID!" };
  }

  const effectiveLimit = limit || 10;
  const offset = ((page || 1) - 1) * effectiveLimit;

  const { count, rows } = await db.ProductSize.findAndCountAll({
    where: { productId },
    limit: effectiveLimit,
    offset,
    order: [sort ? sort.split(',') : ['id', 'DESC']],
    include: [
      { model: db.Product, as: "productData", attributes: ["productId", "name"] },
      { model: db.Size, as: "sizeData", attributes: ["sizeId", "sizeName"] },
    ],
    attributes: { exclude: ["createdAt", "updatedAt", "productId", "sizeId"] },
  });

  return {
    errCode: 0,
    data: {
      totalItems: count,
      totalPages: Math.ceil(count / effectiveLimit),
      currentPage: page || 1,
      productSizes: rows,
    },
    message: "Get all size for a product success"
  };
};

export {
  createNewProductSizeService,
  deleteProductSizeService,
  getAllProductSizeService,
  updateProductSizeService,
};
