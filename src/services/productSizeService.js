import db from "../models/index";
require("dotenv").config();

let checkProductSize = (sizeId, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product = await db.Product_Size.findOne({
        where: { sizeId: sizeId, productId: productId },
      });
      if (product) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let createNewProductSizeService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.sizeId || !data.productId || !data.quantity) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistProductSize = await checkProductSize(
          data.sizeId,
          data.productId
        );
        if (checkExistProductSize) {
          resolve({
            errCode: 2,
            message: "The size of the product already exist",
          });
        } else {
          await db.Product_Size.create({
            sizeId: data.sizeId,
            productId: data.productId,
            quantity: data.quantity,
            sold: 0,
          });
          resolve({
            errCode: 0,
            message: "Create a product size succeed",
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

let deleteProductSizeService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let productSize = await db.Product_Size.findOne({
          where: { id: id },
        });
        if (!productSize) {
          resolve({
            errCode: 2,
            message: "Product size isn't exist",
          });
        } else {
          await db.Product_Size.destroy({
            where: { id: id },
          });
          resolve({
            errCode: 0,
            message: "Delete product size succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let checkProductSizeUpdate = (sizeId, productId, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let productSizes = await db.Product_Size.findAll({
        where: { productId: productId },
      });
      productSizes = productSizes.filter((item) => item.id !== +id);
      let result;
      for (let i = 0; i < productSizes.length; i++) {
        if (productSizes[i].sizeId === sizeId) {
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

let updateProductSizeService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.sizeId || !data.productId || !data.id || !data.quantity) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistProduct = await checkProductSizeUpdate(
          data.sizeId,
          data.productId,
          data.id
        );
        if (checkExistProduct) {
          resolve({
            errCode: 2,
            message: "Product size is already exist",
          });
        } else {
          let productSize = await db.Product_Size.findOne({
            where: { id: data.id },
            raw: false,
          });
          if (productSize) {
            productSize.sizeId = data.sizeId;
            productSize.productId = data.productId;
            productSize.quantity = data.quantity;

            await productSize.save();
            resolve({
              errCode: 0,
              message: "Update product size succeed",
            });
          } else {
            resolve({
              errCode: 3,
              message: "Product size isn't exist",
            });
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getAllProductSizeService = (productId, limit, page, sort) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!productId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        if (!limit) limit = +process.env.LIMIT_MANAGE;
        if (!page) page = 1;
        if (!sort) sort = ["id", "DESC"];
        let skip = (page - 1) * limit;
        const { count, rows } = await db.Product_Size.findAndCountAll({
          limit: limit,
          offset: skip,
          order: [sort],
          where: { productId: productId },
          attributes: {
            exclude: ["createdAt", "updatedAt", "productId", "sizeId"],
          },
          include: [
            {
              model: db.Product,
              as: "ProductSizeData",
              attributes: ["productId", "name"],
            },
            {
              model: db.Size,
              as: "SizeData",
              attributes: ["sizeId", "sizeName"],
            },
          ],
          raw: true,
          nest: true,
        });
        resolve({
          errCode: 0,
          total: count,
          currentPage: page,
          totalPage: Math.ceil(count / limit),
          data: rows,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createNewProductSizeService,
  deleteProductSizeService,
  getAllProductSizeService,
  updateProductSizeService,
};
