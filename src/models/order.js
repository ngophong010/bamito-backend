"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
        as: "UserData",
      });
      Order.belongsTo(models.Voucher, {
        foreignKey: "voucherId",
        targetKey: "voucherId",
        as: "VoucherData",
      });
    }
  }
  Order.init(
    {
      orderId: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      voucherId: DataTypes.STRING,
      payment: DataTypes.STRING,
      totalPrice: DataTypes.INTEGER,
      deliveryAddress: DataTypes.TEXT,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Order",
    }
  );
  return Order;
};
