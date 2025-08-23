import db from "../models/index.js";
import { Op } from "sequelize";
import type { ServiceResponse } from "../types/serviceResponse.js";

// Define the shape of the data for type safety
interface ProductTypeData {
  id?: number;
  productTypeId: string;
  productTypeName: string;
}

// --- CREATE ---
const createNewProductTypeService = async (data: ProductTypeData): Promise<ServiceResponse> => {
  const { productTypeId, productTypeName } = data;
  if (!productTypeId || !productTypeName) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  // ENHANCEMENT: Use `findOrCreate` for an atomic operation to prevent race conditions.
  const [productType, created] = await db.ProductType.findOrCreate({
    where: {
      [Op.or]: [{ productTypeId }, { productTypeName }],
    },
    defaults: { productTypeId, productTypeName },
  });

  if (created) {
    return { errCode: 0, message: "Product Type created successfully." };
  } else {
    // If it already existed, determine which field caused the conflict.
    const message = productType.productTypeId === productTypeId
      ? "Product Type ID already exists."
      : "Product Type Name already exists.";
    return { errCode: 2, message };
  }
};

// --- DELETE ---
const deleteProductTypeService = async (id: number): Promise<ServiceResponse> => {
  if (!id) {
    return { errCode: 1, message: "Missing required ID parameter!" };
  }
  const deletedRowCount = await db.ProductType.destroy({ where: { id } });

  if (deletedRowCount === 0) {
    return { errCode: 2, message: "Product Type not found." };
  }
  return { errCode: 0, message: "Product Type deleted successfully." };
};

// --- UPDATE ---
const updateProductTypeService = async (data: ProductTypeData): Promise<ServiceResponse> => {
  const { id, productTypeId, productTypeName } = data;
  if (!id || !productTypeId || !productTypeName) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  const productTypeToUpdate = await db.ProductType.findByPk(id);
  if (!productTypeToUpdate) {
    return { errCode: 3, message: "Product Type not found." };
  }
  
  // ENHANCEMENT 1 & 2: Efficiently and correctly check for duplicates.
  const existingProductType = await db.ProductType.findOne({
    where: {
      [Op.or]: [{ productTypeId }, { productTypeName }],
      id: { [Op.ne]: id }, // Exclude the current record from the check
    },
  });

  if (existingProductType) {
    const message = existingProductType.productTypeId === productTypeId
      ? "Another Product Type with this ID already exists."
      : "Another Product Type with this Name already exists.";
    return { errCode: 2, message };
  }

  await productTypeToUpdate.update({ productTypeId, productTypeName });
  return { errCode: 0, message: "Product Type updated successfully." };
};

// --- READ (GET ONE) ---
const getProductTypeService = async (productTypeId: string): Promise<ServiceResponse> => {
  if (!productTypeId) {
    return { errCode: 1, message: "Missing required Product Type ID!" };
  }

  const productType = await db.ProductType.findOne({
    where: { productTypeId },
    attributes: { exclude: ["id", "createdAt", "updatedAt"] },
  });

  if (!productType) {
    return { errCode: 2, message: "Product Type not found." };
  }
  return { errCode: 0, data: productType, message: "Get product type success" };
};

// --- READ (GET ALL) ---
const getAllProductTypeService = async (
  limit?: number,
  page?: number,
  sort?: string,
  name?: string,
  pagination: boolean = true
): Promise<ServiceResponse> => {
  if (pagination) {
    const effectiveLimit = limit || 10;
    const offset = ((page || 1) - 1) * effectiveLimit;
    const whereClause: { productTypeName?: any } = {};
    if (name) {
      whereClause.productTypeName = { [Op.substring]: name };
    }

    const { count, rows } = await db.ProductType.findAndCountAll({
      where: whereClause,
      limit: effectiveLimit,
      offset,
      order: [sort ? sort.split(',') : ['id', 'DESC']],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    return {
      errCode: 0,
      data: { totalItems: count, totalPages: Math.ceil(count / effectiveLimit), currentPage: page || 1, productTypes: rows }, message:"Get all product sucess!"
    };
  } else {
    // This branch handles fetching all types for dropdowns, etc.
    const productTypes = await db.ProductType.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      order: [['productTypeName', 'ASC']]
    });
    return { errCode: 0, data: productTypes, message:"Get all product type success" };
  }
};

export {
  createNewProductTypeService,
  getProductTypeService,
  updateProductTypeService,
  deleteProductTypeService,
  getAllProductTypeService,
};
