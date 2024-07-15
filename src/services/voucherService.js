import db from "../models/index";
const cloudinary = require("cloudinary").v2;
import { Op } from "sequelize";
require("dotenv").config();

let checkVoucherId = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let voucher = await db.Voucher.findOne({
        where: { voucherId: id },
      });
      if (voucher) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let createNewVoucherService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.voucherId ||
        !data.voucherPrice ||
        !data.quantity ||
        !data.timeStart ||
        !data.timeEnd ||
        !data.urlImage
      ) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistId = await checkVoucherId(data.voucherId);
        if (checkExistId) {
          resolve({
            errCode: 2,
            message: "VoucherId is already exist",
          });
        } else {
          await db.Voucher.create({
            voucherId: data.voucherId,
            voucherPrice: data.voucherPrice,
            quantity: data.quantity,
            timeStart: data.timeStart,
            timeEnd: data.timeEnd,
            image: data.urlImage,
            imageId: data.imageId,
          });
          resolve({
            errCode: 0,
            message: "Create a Voucher succeed",
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

let deleteVoucherService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let voucher = await db.Voucher.findOne({
          where: { id: id },
        });
        if (!voucher) {
          resolve({
            errCode: 2,
            message: "Voucher isn't exist",
          });
        } else {
          await db.Voucher.destroy({
            where: { id: id },
          });
          cloudinary.uploader.destroy(voucher.imageId);
          resolve({
            errCode: 0,
            message: "Delete Voucher succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let checkVoucherIdUpdate = (voucherId, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let vouchers = await db.Voucher.findAll();
      vouchers = vouchers.filter((item) => item.id !== +id);
      let result;
      for (let i = 0; i < vouchers.length; i++) {
        if (vouchers[i].voucherId === voucherId) {
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

let updateVoucherService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.voucherId ||
        !data.voucherPrice ||
        !data.quantity ||
        !data.timeStart ||
        !data.timeEnd ||
        !data.id
      ) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistId = await checkVoucherIdUpdate(data.VoucherId, data.id);
        if (checkExistId) {
          resolve({
            errCode: 2,
            message: "VoucherId is already exist",
          });
        } else {
          let voucher = await db.Voucher.findOne({
            where: { id: data.id },
            raw: false,
          });
          if (voucher) {
            voucher.voucherId = data.voucherId;
            voucher.voucherPrice = data.VoucherName;
            voucher.quantity = data.quantity;
            voucher.timeStart = data.timeStart;
            voucher.timeEnd = data.timeEnd;

            if (data.imageId && data.imageUrl) {
              cloudinary.uploader.destroy(voucher.imageId);
              voucher.imageId = data.imageId;
              voucher.image = data.imageUrl;
            }

            await voucher.save();
            resolve({
              errCode: 0,
              message: "Update Voucher succeed",
            });
          } else {
            resolve({
              errCode: 3,
              message: "Voucher isn't exist",
            });
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getAllVoucherService = (limit, page, sort, name, pagination) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (pagination === "true") {
        let filter = {};
        if (!limit) limit = +process.env.LIMIT_MANAGE;
        if (!page) page = 1;
        if (!sort) sort = ["id", "DESC"];
        if (name) filter.voucherId = { [Op.substring]: name };
        let skip = (page - 1) * limit;
        const { count, rows } = await db.Voucher.findAndCountAll({
          limit: limit,
          offset: skip,
          order: [sort],
          where: filter,
          attributes: {
            exclude: ["createdAt", "updatedAt", "imageId"],
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
        let vouchers = await db.Voucher.findAll({
          attributes: {
            exclude: ["createdAt", "updatedAt", "imageId"],
          },
        });
        resolve({
          errCode: 0,
          data: vouchers,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getAllVoucherUserService = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let today = new Date();
      today.setHours(0, 0, 0, 0);
      let timestampToday = today.getTime();

      let vouchers = await db.Voucher.findAll({
        attributes: {
          exclude: ["createdAt", "updatedAt", "imageId"],
        },
      });

      vouchers = vouchers.map((item) => {
        if (+item.timeEnd > timestampToday && item.quantity > 0) {
          return item;
        } else {
          return {};
        }
      });

      vouchers = vouchers.filter((item) => Object.keys(item).length !== 0);

      resolve({
        errCode: 0,
        data: vouchers,
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createNewVoucherService,
  deleteVoucherService,
  updateVoucherService,
  getAllVoucherService,
  getAllVoucherUserService,
};
