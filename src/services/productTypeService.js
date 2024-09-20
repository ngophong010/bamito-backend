import db from "../models/index";
require("dotenv").config();
import { Op } from "sequelize";

let checkProductTypeId = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let productType = await db.Product_Type.findOne({
        where: { productTypeId: id },
      });
      if (productType) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let checkProductTypeName = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let productType = await db.Product_Type.findOne({
        where: { productTypeName: name },
      });
      if (productType) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let createNewProductTypeService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.productTypeId || !data.productTypeName) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistId = await checkProductTypeId(data.productTypeId);
        let checkExistName = await checkProductTypeName(data.productTypeName);
        if (checkExistId) {
          resolve({
            errCode: 2,
            message: "ProductTypeId is already exist",
          });
        } else if (checkExistName) {
          resolve({
            errCode: 3,
            message: "ProductTypeName is already exist",
          });
        } else {
          await db.Product_Type.create({
            productTypeId: data.productTypeId,
            productTypeName: data.productTypeName,
          });
          resolve({
            errCode: 0,
            message: "Create a productType succeed",
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

let deleteProductTypeService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let productType = await db.Product_Type.findOne({
          where: { id: id },
        });
        if (!productType) {
          resolve({
            errCode: 2,
            message: "ProductType isn't exist",
          });
        } else {
          await db.Product_Type.destroy({
            where: { id: id },
          });
          resolve({
            errCode: 0,
            message: "Delete productType succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let checkProductTypeIdUpdate = (productTypeId, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let productType = await db.Product_Type.findAll();
      productType = productType.filter((item) => item.id !== +id);
      let result;
      for (let i = 0; i < productType.length; i++) {
        if (productType[i].productTypeId === productTypeId) {
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

let checkProductTypeNameUpdate = (productTypeName, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let productType = await db.Product_Type.findAll();
      productType = productType.filter((item) => item.id !== +id);
      let result;
      for (let i = 0; i < productType.length; i++) {
        if (productType[i].productTypeName === productTypeName) {
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

let updateProductTypeService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.productTypeId || !data.productTypeName || !data.id) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistId = await checkProductTypeIdUpdate(
          data.productTypeId,
          data.id
        );
        let checkExistName = await checkProductTypeNameUpdate(
          data.productTypeName,
          data.id
        );
        if (checkExistId) {
          resolve({
            errCode: 2,
            message: "ProductTypeId is already exist",
          });
        } else if (checkExistName) {
          resolve({
            errCode: 3,
            message: "ProductTypeName is already exist",
          });
        } else {
          let productType = await db.Product_Type.findOne({
            where: { id: data.id },
            raw: false,
          });
          if (productType) {
            productType.productTypeId = data.productTypeId;
            productType.productTypeName = data.productTypeName;

            await productType.save();
            resolve({
              errCode: 0,
              message: "Update product type succeed",
            });
          } else {
            resolve({
              errCode: 4,
              message: "Product type isn't exist",
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
let getAllProductTypeService = (limit, page, sort, name, pagination) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (pagination === "true") {
        let filter = {};
        if (!limit) limit = +process.env.LIMIT_MANAGE;
        if (!page) page = 1;
        if (!sort) sort = ["id", "DESC"];
        name === "undefined" ? (name = undefined) : name;
        if (name) filter.productTypeName = { [Op.substring]: name };
        let skip = (page - 1) * limit;
        const { count, rows } = await db.Product_Type.findAndCountAll({
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
        let productTypes = await db.Product_Type.findAll({
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        });
        resolve({
          errCode: 0,
          data: productTypes,
          message: "Get all brand succeed",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getProductTypeService = (productTypeId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!productTypeId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let productType = await db.Product_Type.findOne({
          where: { productTypeId: productTypeId },
          attributes: {
            exclude: ["id", "createdAt", "updatedAt"],
          },
        });
        if (!productType) {
          resolve({
            errCode: 2,
            message: "Product type isn't exist",
          });
        } else {
          resolve({
            errCode: 0,
            data: productType,
            message: "Get productType succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createNewProductTypeService,
  deleteProductTypeService,
  updateProductTypeService,
  getAllProductTypeService,
  getProductTypeService,
};
