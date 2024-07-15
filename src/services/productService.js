import db from "../models/index";
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
import { Op } from "sequelize";

let checkPeoductId = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product = await db.Product.findOne({
        where: { productId: id },
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

let checkProductName = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product = await db.Product.findOne({
        where: { name: name },
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

let createNewProductService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.productId ||
        !data.brandId ||
        !data.productTypeId ||
        !data.name ||
        !data.price ||
        !data.imageUrl
      ) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistId = await checkPeoductId(data.productId);
        let checkExistName = await checkProductName(data.name);
        if (checkExistId) {
          resolve({
            errCode: 2,
            message: "ProductId is already exist",
          });
        } else if (checkExistName) {
          resolve({
            errCode: 3,
            message: "ProductName is already exist",
          });
        } else {
          await db.Product.create({
            productId: data.productId,
            brandId: data.brandId,
            productTypeId: data.productTypeId,
            name: data.name,
            price: data.price,
            image: data.imageUrl,
            imageId: data.imageId,
            descriptionContent: data.descriptionContent,
            descriptionHTML: data.descriptionHTML,
          });
          resolve({
            errCode: 0,
            message: "Create a product succeed",
          });
        }
      }
    } catch (error) {
      if (error.name === "SequelizeForeignKeyConstraintError") {
        console.log(error);
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

let deleteProductService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let product = await db.Product.findOne({
          where: { id: id },
        });
        if (!product) {
          resolve({
            errCode: 2,
            message: "Product isn't exist",
          });
        } else {
          if (product.imageId && product.image) {
            cloudinary.uploader.destroy(product.imageId);
          }
          await db.Product.destroy({
            where: { id: id },
          });
          resolve({
            errCode: 0,
            message: "Product brand succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let checkProductIdUpdate = (productId, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let products = await db.Product.findAll();
      products = products.filter((item) => item.id !== +id);
      let result;
      for (let i = 0; i < products.length; i++) {
        if (products[i].productId === productId) {
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

let checkProductNameUpdate = (productName, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let products = await db.Product.findAll();
      products = products.filter((item) => item.id !== +id);
      let result;
      for (let i = 0; i < products.length; i++) {
        if (products[i].name === productName) {
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

let updateProductService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.productId ||
        !data.brandId ||
        !data.productTypeId ||
        !data.name ||
        !data.price ||
        !data.id
      ) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistId = await checkProductIdUpdate(data.productId, data.id);
        let checkExistName = await checkProductNameUpdate(data.name, data.id);
        if (checkExistId) {
          resolve({
            errCode: 2,
            message: "ProductId is already exist",
          });
        } else if (checkExistName) {
          resolve({
            errCode: 3,
            message: "ProductName is already exist",
          });
        } else {
          let product = await db.Product.findOne({
            where: { id: data.id },
            raw: false,
          });
          if (product) {
            product.productId = data.productId;
            product.brandId = data.brandId;
            product.productTypeId = data.productTypeId;
            product.name = data.name;
            product.price = data.price;
            product.discount = data.discount;
            product.descriptionContent = data.descriptionContent;
            product.descriptionHTML = data.descriptionHTML;
            if (data.imageUrl && data.imageId) {
              cloudinary.uploader.destroy(product.imageId);
              product.image = data.imageUrl;
              product.imageId = data.imageId;
            }
            await product.save();
            resolve({
              errCode: 0,
              message: "Update product succeed",
            });
          } else {
            resolve({
              errCode: 4,
              message: "Product isn't exist",
            });
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleGetNameProductService = (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!productId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let productName = await db.Product.findOne({
          where: { productId: productId },
          attributes: ["name"],
        });
        resolve({
          errCode: 0,
          data: productName,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

//Pagination
let getAllProductService = (limit, page, sort, name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = {};
      if (!limit) limit = +process.env.LIMIT_MANAGE;
      if (!page) page = 1;
      if (!sort) sort = ["id", "DESC"];
      name === "undefined" || name === "null" || name === ""
        ? (name = undefined)
        : name;
      if (name) filter.name = { [Op.substring]: name };
      let skip = (page - 1) * limit;
      const { count, rows } = await db.Product.findAndCountAll({
        limit: limit,
        offset: skip,
        order: [sort],
        where: filter,
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "imageId",
            "brandId",
            "productTypeId",
          ],
        },
        include: [
          {
            model: db.Product_Type,
            as: "productTypeData",
            attributes: ["productTypeId", "productTypeName"],
          },
          {
            model: db.Brand,
            as: "brandData",
            attributes: ["brandId", "brandName"],
          },
        ],
        raw: true,
        nest: true,
      });

      let result = await Promise.all(
        rows.map(async (item) => {
          item.rating = await db.Feedback.findAll({
            where: { productId: item.productId },
            attributes: ["rating"],
          });
          return item;
        })
      );

      result = result.map((item) => {
        if (item.rating.length > 0) {
          let sumRating = item.rating.reduce(
            (acc, current) => current.rating + acc,
            0
          );
          let avg = sumRating / item.rating.length;
          item.rating = +avg.toFixed(1);
        } else {
          item.rating = 0;
        }
        return item;
      });

      resolve({
        errCode: 0,
        total: count,
        currentPage: page,
        totalPage: Math.ceil(count / limit),
        data: result,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let getAllProductOfTheProductTypeService = (
  productTypeId,
  limit,
  page,
  sort,
  filter
) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!productTypeId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let queryFilter = {};
        if (!limit) limit = +process.env.LIMIT_MANAGE;
        if (!page) page = 1;
        if (!sort) sort = ["id", "DESC"];
        if (filter) {
          if (Object.keys(filter).length !== 0) {
            queryFilter = {
              brandId: {
                [Op.or]: filter?.brandId ? filter?.brandId : [],
              },
              price: {
                [Op.between]: [filter?.price[0], filter?.price[1]],
              },
            };
          }
        }

        let skip = (page - 1) * limit;
        const { count, rows } = await db.Product.findAndCountAll({
          limit: limit,
          offset: skip,
          order: [sort],
          where: {
            productTypeId: productTypeId,
            ...queryFilter,
          },
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "imageId",
              "brandId",
              "productTypeId",
              "rating",
            ],
          },
          include: [
            {
              model: db.Product_Type,
              as: "productTypeData",
              attributes: ["productTypeId", "productTypeName"],
            },
            {
              model: db.Brand,
              as: "brandData",
              attributes: ["brandId", "brandName"],
            },
          ],
          raw: true,
          nest: true,
        });

        let result = await Promise.all(
          rows.map(async (item) => {
            item.rating = await db.Feedback.findAll({
              where: { productId: item.productId },
              attributes: ["rating"],
            });
            return item;
          })
        );

        result = result.map((item) => {
          if (item.rating.length > 0) {
            let sumRating = item.rating.reduce(
              (acc, current) => current.rating + acc,
              0
            );
            let avg = sumRating / item.rating.length;
            item.rating = +avg.toFixed(1);
          } else {
            item.rating = 0;
          }
          return item;
        });

        resolve({
          errCode: 0,
          total: count,
          currentPage: page,
          totalPage: Math.ceil(count / limit),
          data: result,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getProductService = (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!productId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let product = await db.Product.findOne({
          where: { productId: productId },
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "id",
              "brandId",
              "productTypeId",
              "imageId",
              "descriptionContent",
            ],
          },
          include: [
            {
              model: db.Product_Type,
              as: "productTypeData",
              attributes: ["productTypeId", "productTypeName"],
            },
            {
              model: db.Brand,
              as: "brandData",
              attributes: ["brandId", "brandName"],
            },
          ],
          raw: true,
          nest: true,
        });
        let sizeProducts = await db.Product_Size.findAll({
          where: { productId: productId },
          attributes: ["quantity", "sold"],
          order: [["id", "ASC"]],
          include: [
            {
              model: db.Size,
              as: "SizeData",
              attributes: ["sizeId", "sizeName"],
            },
          ],
          raw: true,
          nest: true,
        });
        sizeProducts = sizeProducts.map((size) => {
          return { quantity: size.quantity, sold: size.sold, ...size.SizeData };
        });
        product.SizeData = sizeProducts;

        product.rating = await db.Feedback.findAll({
          where: { productId: product.productId },
          attributes: ["rating"],
        });

        if (product.rating.length > 0) {
          let sumRating = product.rating.reduce(
            (acc, current) => current.rating + acc,
            0
          );
          let avg = sumRating / product.rating.length;
          product.rating = +avg.toFixed(1);
        } else {
          product.rating = 0;
        }

        resolve({
          errCode: 0,
          data: product,
          message: "Get product succeed",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getAllProuctFeedbackService = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let orderIds = await db.Order.findAll({
          where: { userId: userId, status: 3 },
        });

        let result = await Promise.all(
          orderIds.map(async (item) => {
            let orderDetail = await db.Order_History.findAll({
              where: { orderId: item.orderId, statusFeedback: 0 },
              attributes: {
                exclude: ["createdAt", "updatedAt", "id", "sizeId"],
              },
              include: [
                {
                  model: db.Size,
                  as: "SizeOrderDetailData",
                  attributes: ["sizeId", "sizeName"],
                },
                {
                  model: db.Product,
                  as: "ProductDetailData",
                  attributes: ["image", "name", "price", "discount"],
                },
              ],
              raw: true,
              nest: true,
            });
            return orderDetail;
          })
        );

        let mergedData = result.reduce(
          (acc, current) => acc.concat(current),
          []
        );

        mergedData = mergedData.map((item) => {
          return {
            productId: item.productId,
            orderId: item.orderId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            sizeId: item.SizeOrderDetailData.sizeId,
            sizeName: item.SizeOrderDetailData.sizeName,
            image: item.ProductDetailData.image,
            name: item.ProductDetailData.name,
            price: item.ProductDetailData.price,
            discount: item.ProductDetailData.discount,
          };
        });

        resolve({
          errCode: 0,
          data: mergedData,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getAllProductSaleOffService = (limit, page) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!limit) limit = +process.env.LIMIT_MANAGE;
      if (!page) page = 1;
      let skip = (page - 1) * limit;
      const { count, rows } = await db.Product.findAndCountAll({
        limit: limit,
        offset: skip,
        order: [["id", "DESC"]],
        where: {
          discount: {
            [Op.gt]: 0,
          },
        },
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "imageId",
            "brandId",
            "productTypeId",
          ],
        },
        include: [
          {
            model: db.Product_Type,
            as: "productTypeData",
            attributes: ["productTypeId", "productTypeName"],
          },
          {
            model: db.Brand,
            as: "brandData",
            attributes: ["brandId", "brandName"],
          },
        ],
        raw: true,
        nest: true,
      });

      let result = await Promise.all(
        rows.map(async (item) => {
          item.rating = await db.Feedback.findAll({
            where: { productId: item.productId },
            attributes: ["rating"],
          });
          return item;
        })
      );

      result = result.map((item) => {
        if (item.rating.length > 0) {
          let sumRating = item.rating.reduce(
            (acc, current) => current.rating + acc,
            0
          );
          let avg = sumRating / item.rating.length;
          item.rating = +avg.toFixed(1);
        } else {
          item.rating = 0;
        }
        return item;
      });

      resolve({
        errCode: 0,
        total: count,
        currentPage: page,
        totalPage: Math.ceil(count / limit),
        data: result,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let getAllProductFavouriteService = (limit, page, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        if (!limit) limit = +process.env.LIMIT_MANAGE;
        if (!page) page = 1;
        let skip = (page - 1) * limit;
        const { count, rows } = await db.Favourite.findAndCountAll({
          limit: limit,
          offset: skip,
          order: [["id", "DESC"]],
          where: { userId: userId },
          attributes: {
            exclude: ["createdAt", "updatedAt", "id", "userId", "productId"],
          },
          include: [
            {
              model: db.Product,
              as: "ProductFavouriteData",
              attributes: {
                exclude: [
                  "createdAt",
                  "updatedAt",
                  "imageId",
                  "brandId",
                  "productTypeId",
                  "descriptionContent",
                  "descriptionHTML",
                ],
              },
              include: [
                {
                  model: db.Product_Type,
                  as: "productTypeData",
                  attributes: ["productTypeId", "productTypeName"],
                },
                {
                  model: db.Brand,
                  as: "brandData",
                  attributes: ["brandId", "brandName"],
                },
              ],
            },
          ],
          raw: true,
          nest: true,
        });

        let data = rows.map((item) => {
          return { ...item.ProductFavouriteData };
        });

        let result = await Promise.all(
          data.map(async (item) => {
            item.rating = await db.Feedback.findAll({
              where: { productId: item.productId },
              attributes: ["rating"],
            });
            return item;
          })
        );

        result = result.map((item) => {
          if (item.rating.length > 0) {
            let sumRating = item.rating.reduce(
              (acc, current) => current.rating + acc,
              0
            );
            let avg = sumRating / item.rating.length;
            item.rating = +avg.toFixed(1);
          } else {
            item.rating = 0;
          }
          return item;
        });

        resolve({
          errCode: 0,
          total: count,
          currentPage: page,
          totalPage: Math.ceil(count / limit),
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  handleGetNameProductService,
  createNewProductService,
  deleteProductService,
  updateProductService,
  getAllProductService,
  getProductService,
  getAllProductOfTheProductTypeService,
  getAllProuctFeedbackService,
  getAllProductSaleOffService,
  getAllProductFavouriteService,
};
