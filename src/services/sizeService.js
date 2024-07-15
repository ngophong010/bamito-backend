import db from "../models/index";
require("dotenv").config();
import { Op } from "sequelize";

let checkSizeId = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let size = await db.Size.findOne({
        where: { sizeId: id },
      });
      if (size) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let checkSizeName = (sizeName, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let sizes = await db.Size.findAll({ where: { productTypeId: id } });
      let result;
      for (let i = 0; i < sizes.length; i++) {
        if (sizes[i].sizeName === sizeName) {
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

let createNewSizeService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.sizeId || !data.productTypeId || !data.sizeName) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistId = await checkSizeId(data.sizeId);
        let checkExistSizeName = await checkSizeName(
          data.sizeName,
          data.productTypeId
        );
        if (checkExistId) {
          resolve({
            errCode: 2,
            message: "SizeId is already exist",
          });
        } else if (checkExistSizeName) {
          resolve({
            errCode: 3,
            message: "SizeName is already exist",
          });
        } else {
          await db.Size.create({
            sizeId: data.sizeId,
            productTypeId: data.productTypeId,
            sizeName: data.sizeName,
          });
          resolve({
            errCode: 0,
            message: "Create a size succeed",
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

let deleteSizeService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let size = await db.Size.findOne({
          where: { id: id },
        });
        if (!size) {
          resolve({
            errCode: 2,
            message: "Size isn't exist",
          });
        } else {
          await db.Size.destroy({
            where: { id: id },
          });
          resolve({
            errCode: 0,
            message: "Delete Size succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let checkSizeNameUpdate = (sizeName, productTypeId, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let sizes = await db.Size.findAll({
        where: { productTypeId: productTypeId },
      });
      sizes = sizes.filter((item) => item.id !== +id);
      let result;
      for (let i = 0; i < sizes.length; i++) {
        if (sizes[i].sizeName === sizeName) {
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

let checkSizeIdUpdate = (sizeId, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let sizes = await db.Size.findAll();
      sizes = sizes.filter((item) => item.id !== +id);
      let result;
      for (let i = 0; i < sizes.length; i++) {
        if (sizes[i].sizeId === sizeId) {
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

let updateSizeService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.sizeId || !data.productTypeId || !data.sizeName || !data.id) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistId = await checkSizeIdUpdate(data.sizeId, data.id);
        let checkExistSizeName = await checkSizeNameUpdate(
          data.sizeName,
          data.productTypeId,
          data.id
        );
        if (checkExistId) {
          resolve({
            errCode: 2,
            message: "SizeId is already exist",
          });
        } else if (checkExistSizeName) {
          resolve({
            errCode: 3,
            message: "SizeName is already exist",
          });
        } else {
          let size = await db.Size.findOne({
            where: { id: data.id },
            raw: false,
          });
          if (size) {
            size.sizeId = data.sizeId;
            size.productTypeId = data.productTypeId;
            size.sizeName = data.sizeName;

            await size.save();
            resolve({
              errCode: 0,
              message: "Update size succeed",
            });
          } else {
            resolve({
              errCode: 4,
              message: "Size isn't exist",
            });
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Pagination
let getAllSizeService = (limit, page, sort, name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = {};
      if (!limit) limit = +process.env.LIMIT_MANAGE;
      if (!page) page = 1;
      if (!sort) sort = ["id", "DESC"];
      name === "undefined" ? (name = undefined) : name;
      if (name) filter.sizeName = { [Op.substring]: name };
      let skip = (page - 1) * limit;
      const { count, rows } = await db.Size.findAndCountAll({
        limit: limit,
        offset: skip,
        order: [sort],
        where: filter,
        attributes: {
          exclude: ["createdAt", "updatedAt", "productTypeId"],
        },
        include: [
          {
            model: db.Product_Type,
            as: "productTypeSizeData",
            attributes: ["productTypeId", "productTypeName"],
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
    } catch (error) {
      reject(error);
    }
  });
};
// let getAllSizeService = () => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let sizes = await db.Size.findAll({
//         attributes: {
//           exclude: ["createdAt", "updatedAt", "productTypeId"],
//         },
//         include: [
//           {
//             model: db.Product_Type,
//             as: "productTypeSizeData",
//             attributes: ["productTypeId", "productTypeName"],
//           },
//         ],
//         raw: true,
//         nest: true,
//       });
//       resolve({
//         errCode: 0,
//         data: sizes,
//         message: "Get all size succeed",
//       });
//     } catch (error) {
//       reject(error);
//     }
//   });
// };

let getAllSizeProductType = (productTypeId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!productTypeId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let sizes = await db.Size.findAll({
          where: { productTypeId: productTypeId },
          attributes: {
            exclude: ["createdAt", "updatedAt", "productTypeId", "id"],
          },
          include: [
            {
              model: db.Product_Type,
              as: "productTypeSizeData",
              attributes: ["productTypeId", "productTypeName"],
            },
          ],
          raw: true,
          nest: true,
        });
        resolve({
          errCode: 0,
          data: sizes,
          message: "Get all size succeed",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createNewSizeService,
  deleteSizeService,
  updateSizeService,
  getAllSizeService,
  getAllSizeProductType,
};
