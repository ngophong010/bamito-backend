import db from "../models/index.js";
import { Op } from "sequelize";
import type { ServiceResponse } from "../types/serviceResponse.js";

interface BrandData {
  brandId: string;
  brandName: string;
  id?: number;
}

const createNewBrandService = async (data: BrandData): Promise<ServiceResponse> => {
  if (!data.brandId || !data.brandName) {
    return { errCode: 1, message: "Missing required parameter!!!" };
  }

  const exsistingBrand = await db.Brand.findOne({
    where: {
      [Op.or]: [
        { brandId: data.brandId },
        { brandName: data.brandName }
      ]
    }
  });

  if (exsistingBrand) {
    const message = exsistingBrand.brandId === data.brandId
      ? "BrandId is already exist"
      : "BrandName is already exist";
    return { errCode: 2, message};
  }

  await db.Brand.create({
    brandId: data.brandId,
    brandName: data.brandName,
  });

  return { errCode: 0, message: "Create a brand succeed" };
};

const deleteBrandService = async (id: string): Promise<ServiceResponse> => {
  if (!id) {
    return { errCode: 1, message: "Missing required ID parameter!!!" };
  }

  const brand = await db.Brand.findByPk(id);

  if (!brand) {
    return { errCode: 2, message: "Brand isn't exist" };
  }

  await db.Brand.destroy();

  return { errCode: 0, message: "Delete brand succeed" };
};

const updateBrandService = async (data: BrandData): Promise<ServiceResponse> => {
  if (!data.brandId || !data.brandName || !data.id) {
    return { errCode: 1, message: "Missing required parameter!!!" };
  }

  const existingBrand = await db.Brand.findOne({
    where: {
      [Op.or]: [{ brandId: data.brandId }, { brandName: data.brandName }],
      id: { [Op.ne]: data.id }, // Op.ne means "not equal"
    },
  });

  if (existingBrand) {
    const message = existingBrand.brandId === data.brandId
      ? "Another brand with this ID already exists."
        : "Another brand with this Name already exists.";
    return { errCode: 2, message };
  }

  const brandToUpdate = await db.Brand.findByPk(data.id);

  if (!brandToUpdate) {
    return { errCode: 3, message: "Brand isn't exist" };
  }

  brandToUpdate.brandId = data.brandId;
  brandToUpdate.brandName = data.brandName;
  await brandToUpdate.save();

  return { errCode: 0, message: "Update brand succeed" };
};

//Pagination
const getAllBrandService = async (
  limit: number, 
  page: number,
  sort: string,
  name: string,
  pagination: boolean
):Promise<ServiceResponse> => {
  if (pagination) {
    const effectiveLimit = limit || 10;
    const effectivePage = page || 1;
    const offset = (effectivePage - 1) * effectiveLimit;
    const whereClause: {brandName?: any} = {};

    if (name) {
      whereClause.brandName = { [Op.substring]: name };
    }

    const { count, rows } = await db.Brand.findAndCountAll({
      limit: effectiveLimit,
      offset,
      where: whereClause,
      order: [sort ? sort.split(',') : ['id', 'DESC']], // Allow for sorting like 'name,ASC'
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    return {
      errCode: 0,
      data: {
        totalItems: count,
        totalPages: Math.ceil(count / effectiveLimit),
        currentPage: effectivePage,
        brands: rows,
      },
      message: "Get all brands succeed",
    };
  } else {
    const brands = await db.Brand.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    return { errCode: 0, data: brands, message: "Get all brands succeed" };
  }
};

export {
  createNewBrandService,
  deleteBrandService,
  updateBrandService,
  getAllBrandService
}