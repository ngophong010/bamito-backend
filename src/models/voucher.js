"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Voucher.hasMany(models.Order, {
        foreignKey: "voucherId",
        as: "VoucherData",
      });
    }
  }
  Voucher.init(
    {
      voucherId: DataTypes.STRING,
      image: DataTypes.STRING,
      imageId: DataTypes.STRING,
      voucherPrice: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      timeStart: DataTypes.STRING,
      timeEnd: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Voucher",
    }
  );
  return Voucher;
};
