import db from "../models/index.js";
import { Op } from "sequelize";
import type { ServiceResponse } from "../types/serviceResponse.js";

interface SizeData {
  id?: number;
  sizeId: string;
  sizeName: string;
  productTypeId: number;
}

// --- CREATE ---
const createNewSizeService = async(data: SizeData): Promise<ServiceResponse> => {
  const { sizeId, sizeName, productTypeId } = data;
  if (!sizeId || !sizeName || !productTypeId) {
    return {
      errCode: 1,
      message: "Missing required parameter!!!",
    };
  }

  const existingSize = await db.Size.findOne({
    where: {
      [Op.or]: [
        { sizeId },
        { sizeName, productTypeId }
      ]
    }
  })

  if (existingSize) {
    const message = existingSize.sizeId === sizeId
      ? "SizeId is already exist"
      : `Size Name "${sizeName}" already exists for this product type.`;
    return { errCode: 2, message}
  }

  await db.Size.create({ sizeId, productTypeId, sizeName });
  return {
    errCode: 0,
    message: "Create new size succeed",
  };
};

// --- DELETE ---
const deleteSizeService = async(id: number): Promise<ServiceResponse> => {
  if (!id) {
    return {
      errCode: 1,
      message: "Missing required parameter!!!",
    };
  }
  const size = await db.Size.findByPk(id);
  if (!size) {
    return { errCode: 2, message: "Size not found." };
  }
  await size.destroy();
  return { errCode: 0, message: "Size deleted successfully." };
};

// --- UPDATE ---
const updateSizeService = async(data: SizeData): Promise<ServiceResponse> => {
  const { id, sizeId, productTypeId, sizeName } = data;
  if (!id || !sizeId || !productTypeId || !sizeName) {
    return {
      errCode: 1,
      message: "Missing required parameter!!!",
    };
  }

  const sizeToUpdate = await db.Size.findByPk(id);
  if (!sizeToUpdate) {
    return { errCode: 3, message: "Size not found." };
  }

  const existingSize = await db.Size.findOne({
    where: {
      [Op.or]: [
        { sizeId },
        { sizeName, productTypeId }
      ],
      id: { [Op.ne]: id } // Exclude the current record
    }
  });

  if (existingSize) {
    const message = existingSize.sizeId === sizeId
      ? "SizeId is already exist"
      : `Size Name "${sizeName}" already exists for this product type.`;
    return { errCode: 2, message}
  }

  await sizeToUpdate.update(data);
  return {
    errCode: 0,
    message: "Update size succeed",
  };
};

// --- READ (GET ALL - PAGINATED) ---
const getAllSizeService = async(
  limit?: number,
  page?: number,
  sort?: string,
  name?: string
):Promise<ServiceResponse> => {
  const effectiveLimit = limit || 10;
  const offset = ((page || 1) - 1) * effectiveLimit;
  const whereClause: { sizeName?: any } = {};
  if (name) {
    whereClause.sizeName = { [Op.substring]: name  };
  }

  const { count, rows } = await db.Size.findAndCountAll({
    where: whereClause,
    limit: effectiveLimit,
    offset,
    order: [sort ? sort.split(',') : ['id', 'DESC']],
    include: [{
      model: db.ProductType,
      as: "productType", // Use the correct alias from the refactored model
      attributes: ["productTypeId", "productTypeName"],
    }],
    attributes: { exclude: ["createdAt", "updatedAt", "productTypeId"] },
    // Use `raw: false` or `nest: true` but not both if you plan to use instance methods
  });

  return {
    errCode: 0,
    data: {
      totalItems: count,
      totalPages: Math.ceil(count / effectiveLimit),
      currentPage: page || 1,
      sizes: rows,
    },
    message: "Get all size succeed",
  };
};

// --- READ (GET ALL SIZES FOR A SPECIFIC PRODUCT TYPE) ---
const getAllSizeProductType = async(productTypeId: number): Promise<ServiceResponse> => {
  if (!productTypeId) {
    return {
      errCode: 1,
      message: "Missing required parameter!!!",
    };
  }

  const sizes = await db.Size.findAll({
    where: { productTypeId },
    attributes: ["id", "sizeId", "sizeName"], // Select only what you need
    order: [["sizeName", "ASC"]],
  });

  return {
    errCode: 0,
    data: sizes,
    message: "Get sizes for product type succeed",
  };
};

export {
  createNewSizeService,
  deleteSizeService,
  updateSizeService,
  getAllSizeService,
  getAllSizeProductType,
};
