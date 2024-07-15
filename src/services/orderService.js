import db from "../models/index";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
require("dotenv").config();

let createNewOrderService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.cartId ||
        !data.userId ||
        !data.totalPrice ||
        !data.payment ||
        !data.deliveryAddress ||
        !data.status
      ) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        const orderId = uuidv4();
        await db.Order.create({
          orderId: orderId.slice(orderId.length - 10, orderId.length),
          userId: data.userId,
          voucherId: data.voucherId ? data.voucherId : null,
          totalPrice: data.totalPrice,
          payment: data.payment,
          deliveryAddress: data.deliveryAddress,
          status: data.status,
        });
        if (data.voucherId) {
          let voucher = await db.Voucher.findOne({
            where: { voucherId: data.voucherId },
            raw: false,
          });
          voucher.quantity = voucher.quantity - 1;
          await voucher.save();
        }
        let productDetails = await db.Cart_Detail.findAll({
          where: { cartId: data.cartId },
          attributes: ["productId", "sizeId", "quantity", "totalPrice"],
        });
        productDetails = productDetails.map((item) => {
          return {
            orderId: orderId.slice(orderId.length - 10, orderId.length),
            ...item,
          };
        });
        await Promise.all(
          productDetails.map(async (item) => {
            let product = await db.Product_Size.findOne({
              where: { productId: item.productId, sizeId: item.sizeId },
              raw: false,
            });
            product.quantity = product.quantity - item.quantity;
            await product.save();
          })
        );
        await db.Order_History.bulkCreate(productDetails);
        await db.Cart_Detail.destroy({
          where: {
            cartId: data.cartId,
          },
        });
        resolve({
          errCode: 0,
          orderId: orderId.slice(orderId.length - 10, orderId.length),
          message: "Create a order succeed",
        });
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

let cancleOrderService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.orderId && !data.orderDetail) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let order = await db.Order.findOne({
          where: { orderId: data.orderId },
          raw: false,
        });
        if (order) {
          order.status = 0;
          await order.save();
          await Promise.all(
            data.orderDetail.map(async (item) => {
              let product = await db.Product_Size.findOne({
                where: { productId: item.productId, sizeId: item.sizeId },
                raw: false,
              });
              product.quantity = product.quantity + item.quantity;
              await product.save();
            })
          );
          resolve({
            errCode: 0,
            message: "Cancle order succeed",
          });
        } else {
          resolve({
            errCode: 2,
            message: "Order isn't exist",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let deliveringOrderService = (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!orderId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let order = await db.Order.findOne({
          where: { orderId: orderId },
          raw: false,
        });
        if (order) {
          order.status = 2;
          await order.save();
          resolve({
            errCode: 0,
            message: "Delivering order succeed",
          });
        } else {
          resolve({
            errCode: 2,
            message: "Order isn't exist",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let succeedOrderService = (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!orderId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let order = await db.Order.findOne({
          where: { orderId: orderId },
          raw: false,
        });
        if (order) {
          order.status = 3;
          await order.save();
          resolve({
            errCode: 0,
            message: "Succeed order succeed",
          });
        } else {
          resolve({
            errCode: 2,
            message: "Order isn't exist",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let deleteOrderService = (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!orderId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let order = await db.Order.findOne({
          where: { orderId: orderId },
        });
        if (!order) {
          resolve({
            errCode: 2,
            message: "Order isn't exist",
          });
        } else {
          await db.Order.destroy({
            where: { orderId: orderId },
          });
          resolve({
            errCode: 0,
            message: "Delete order succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getOrderDetailService = (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!orderId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let order = await db.Order.findOne({
          where: { orderId: orderId },
          attributes: {
            exclude: ["updatedAt", "id"],
          },
          include: [
            {
              model: db.User,
              as: "UserData",
              attributes: ["userName", "phoneNumber"],
            },
            {
              model: db.Voucher,
              as: "VoucherData",
              attributes: ["voucherId", "voucherPrice"],
            },
          ],
          raw: true,
          nest: true,
        });

        let orderDetail = await db.Order_History.findAll({
          where: { orderId: orderId },
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "id",
              "orderId",
              "sizeId",
              "productId",
            ],
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
              attributes: ["productId", "image", "name", "price", "discount"],
            },
          ],
          raw: true,
          nest: true,
        });
        let result = orderDetail.map((item) => {
          return {
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            sizeId: item.SizeOrderDetailData.sizeId,
            sizeName: item.SizeOrderDetailData.sizeName,
            image: item.ProductDetailData.image,
            name: item.ProductDetailData.name,
            productId: item.ProductDetailData.productId,
            price: item.ProductDetailData.price,
            discount: item.ProductDetailData.discount,
          };
        });
        order.orderDetail = result;
        resolve({
          errCode: 0,
          data: order,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

//Pagination
let getAllOrderService = (userId, status, limit, page) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId || !status) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        if (!limit) limit = +process.env.LIMIT_MANAGE;
        if (!page) page = 1;
        let skip = (page - 1) * limit;
        const { count, rows } = await db.Order.findAndCountAll({
          where: { userId: userId, status: status },
          limit: limit,
          offset: skip,
          order: [["id", "DESC"]],
          attributes: {
            exclude: ["updatedAt", "userId", "id", "deliveryAddress"],
          },
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

let getAllOrderAdminService = (status, limit, page) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!status) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        if (!limit) limit = +process.env.LIMIT_MANAGE;
        if (!page) page = 1;
        let skip = (page - 1) * limit;
        const { count, rows } = await db.Order.findAndCountAll({
          where: { status: status },
          limit: limit,
          offset: skip,
          order: [["id", "DESC"]],
          attributes: {
            exclude: ["updatedAt", "userId", "id", "deliveryAddress"],
          },
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

let getStatisticsService = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let orderIds = await db.Order.findAll({
        where: { status: 3 },
        attributes: ["orderId"],
      });
      let result = await Promise.all(
        orderIds.map(async (item) => {
          let product = await db.Order_History.findAll({
            where: { orderId: item.orderId },
            attributes: {
              exclude: ["id", "statusFeedback", "updatedAt"],
            },
          });
          return product;
        })
      );

      result = result.reduce((acc, current) => acc.concat(current), []);

      result = result.map((item) => {
        return {
          orderId: item.orderId,
          productId: item.productId,
          sizeId: item.sizeId,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          time: item.createdAt,
        };
      });

      let totalIncome = result.reduce((acc, curr) => acc + curr.totalPrice, 0);

      let totalOrder = await db.Order.count();
      let totalProduct = await db.Product.count();
      let totalOrderWatting = await db.Order.count({
        where: { status: 1 },
      });
      let totalOrderDelivering = await db.Order.count({
        where: { status: 2 },
      });
      let totalOrderSuccess = await db.Order.count({
        where: { status: 3 },
      });
      let totalOrderCancel = await db.Order.count({
        where: { status: 0 },
      });

      resolve({
        errCode: 0,
        data: {
          allProduct: result,
          totalIncome: totalIncome,
          totalOrder: totalOrder,
          totalProduct: totalProduct,
          allTotalOrder: [
            {
              label: "Xác nhận",
              quantity: totalOrderWatting,
            },
            {
              label: "Đang giao",
              quantity: totalOrderDelivering,
            },
            {
              label: "Hoàn tất",
              quantity: totalOrderSuccess,
            },
            {
              label: "Đã hủy",
              quantity: totalOrderCancel,
            },
          ],
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

let getAllProductReport = (timeStart, timeEnd, limit, page) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!timeStart || !timeEnd) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let orderIds = await db.Order.findAll({
          where: { status: 3 },
          attributes: ["orderId"],
        });
        let result = await Promise.all(
          orderIds.map(async (item) => {
            let product = await db.Order_History.findAll({
              where: { orderId: item.orderId },
              attributes: {
                exclude: ["id", "statusFeedback", "updatedAt"],
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
            return product;
          })
        );

        result = result.reduce((acc, current) => acc.concat(current), []);

        result = result.map((item) => {
          return {
            name: item.ProductDetailData.name,
            price: item.ProductDetailData.price,
            discount: item.ProductDetailData.discount,
            sizeName: item.SizeOrderDetailData.sizeName,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            time: item.createdAt,
          };
        });

        if (!limit) limit = +process.env.LIMIT_MANAGE;
        if (!page) page = 1;
        let skip = (page - 1) * limit;

        let data = [];
        for (let i = skip; i < limit * page; i++) {
          if (result[i]) {
            let timeStamp = moment(result[i].time).valueOf();
            if (
              moment(timeStamp).isBefore(timeEnd) &&
              moment(timeStamp).isAfter(timeStart)
            )
              data.push(result[i]);
          }
        }
        resolve({
          errCode: 0,
          total: result.length,
          currentPage: page,
          totalPage: Math.ceil(result.length / limit),
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createNewOrderService,
  getAllOrderService,
  getOrderDetailService,
  cancleOrderService,
  getAllOrderAdminService,
  deliveringOrderService,
  succeedOrderService,
  deleteOrderService,
  getStatisticsService,
  getAllProductReport,
};
