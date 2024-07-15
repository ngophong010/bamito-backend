import db from "../models/index";
import { Op } from "sequelize";
require("dotenv").config();

let checkBrandId = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let brand = await db.Brand.findOne({
        where: { brandId: id },
      });
      if (brand) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let checkBrandName = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let brand = await db.Brand.findOne({
        where: { brandName: name },
      });
      if (brand) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let createNewBrandService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.brandId || !data.brandName) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistId = await checkBrandId(data.brandId);
        let checkExistName = await checkBrandName(data.brandName);
        if (checkExistId) {
          resolve({
            errCode: 2,
            message: "BrandId is already exist",
          });
        } else if (checkExistName) {
          resolve({
            errCode: 3,
            message: "BrandName is already exist",
          });
        } else {
          await db.Brand.create({
            brandId: data.brandId,
            brandName: data.brandName,
          });
          resolve({
            errCode: 0,
            message: "Create a brand succeed",
          });
        }
      }
    } catch (error) {
      if (error.name === "SequelizeForeignKeyConstraintError") {
        resolve({
          errCode: -2,
          message: "Error foreign key",
        });
      } else {
        reject(error);
      }
    }
  });
};

let deleteBrandService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let brand = await db.Brand.findOne({
          where: { id: id },
        });
        if (!brand) {
          resolve({
            errCode: 2,
            message: "Brand isn't exist",
          });
        } else {
          await db.Brand.destroy({
            where: { id: id },
          });
          resolve({
            errCode: 0,
            message: "Delete brand succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let checkBrandIdUpdate = (brandId, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let brands = await db.Brand.findAll();
      brands = brands.filter((item) => item.id !== +id);
      let result;
      for (let i = 0; i < brands.length; i++) {
        if (brands[i].brandId === brandId) {
          result = true;
          break;
        } else {
          result = false;
        }
      }
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

let checkBrandNameUpdate = (brandName, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let brands = await db.Brand.findAll();
      brands = brands.filter((item) => item.id !== +id);
      let result;
      for (let i = 0; i < brands.length; i++) {
        if (brands[i].brandName === brandName) {
          result = true;
          break;
        } else {
          result = false;
        }
      }
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

let updateBrandService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.brandId || !data.brandName || !data.id) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistId = await checkBrandIdUpdate(data.brandId, data.id);
        let checkExistName = await checkBrandNameUpdate(
          data.brandName,
          data.id
        );
        if (checkExistId) {
          resolve({
            errCode: 2,
            message: "BrandId is already exist",
          });
        } else if (checkExistName) {
          resolve({
            errCode: 3,
            message: "BrandName is already exist",
          });
        } else {
          let brand = await db.Brand.findOne({
            where: { id: data.id },
            raw: false,
          });
          if (brand) {
            brand.brandId = data.brandId;
            brand.brandName = data.brandName;

            await brand.save();
            resolve({
              errCode: 0,
              message: "Update brand succeed",
            });
          } else {
            resolve({
              errCode: 4,
              message: "Brand isn't exist",
            });
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

//Pagination
let getAllBrandService = (limit, page, sort, name, pagination) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (pagination === "true") {
        let filter = {};
        if (!limit) limit = +process.env.LIMIT_MANAGE;
        if (!page) page = 1;
        if (!sort) sort = ["id", "DESC"];
        name === "undefined" ? (name = undefined) : name;
        if (name) filter.brandName = { [Op.substring]: name };
        let skip = (page - 1) * limit;
        const { count, rows } = await db.Brand.findAndCountAll({
          limit: limit,
          offset: skip,
          order: [sort],
          where: filter,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        });
        resolve({
          errCode: 0,
          total: count,
          currentPage: page,
          totalPage: Math.ceil(count / limit),
          data: rows,
        });
      } else {
        let brands = await db.Brand.findAll({
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        });
        resolve({
          errCode: 0,
          data: brands,
          message: "Get all brand succeed",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createNewBrandService,
  deleteBrandService,
  updateBrandService,
  getAllBrandService,
};
