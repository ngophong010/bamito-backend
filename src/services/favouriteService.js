import db from "../models/index";
require("dotenv").config();

let checkFavourite = (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let favourite = await db.Favourite.findOne({
        where: { userId: userId, productId: productId },
      });
      if (favourite) resolve(true);
      else resolve(false);
    } catch (error) {
      console.log(error);
    }
  });
};

let createNewFavouriteService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId || !data.productId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistFavourite = await checkFavourite(
          data.userId,
          data.productId
        );
        if (checkExistFavourite) {
          resolve({
            errCode: 2,
            message: "Favourite is already exist",
          });
        } else {
          await db.Favourite.create({
            userId: data.userId,
            productId: data.productId,
          });
          resolve({
            errCode: 0,
            message: "Create a favourite succeed",
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

let deleteFavouriteService = (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId || !productId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let favourite = await db.Favourite.findOne({
          where: { userId: userId, productId: productId },
        });
        if (!favourite) {
          resolve({
            errCode: 2,
            message: "Favourite isn't exist",
          });
        } else {
          await db.Favourite.destroy({
            where: { userId: userId, productId: productId },
          });
          resolve({
            errCode: 0,
            message: "Delete favourite succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let updateFavouriteService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId || !data.productId || !data.id) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let favourite = await db.Favourite.findOne({
          where: { id: data.id },
          raw: false,
        });
        if (favourite) {
          favourite.userId = data.userId;
          favourite.productId = data.productId;

          await favourite.save();
          resolve({
            errCode: 0,
            message: "Update favourite succeed",
          });
        } else {
          resolve({
            errCode: 2,
            message: "Favourite isn't exist",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getAllFavouriteService = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let favourite = await db.Favourite.findAll({
          where: { userId: userId },
          attributes: {
            exclude: ["createdAt", "updatedAt", "id"],
          },
        });
        favourite = favourite.map((item) => item.productId);
        resolve({
          errCode: 0,
          data: favourite,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createNewFavouriteService,
  deleteFavouriteService,
  updateFavouriteService,
  getAllFavouriteService,
};
