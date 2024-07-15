"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order_History extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order_History.belongsTo(models.Product, {
        foreignKey: "productId",
        targetKey: "productId",
        as: "ProductDetailData",
      });
      Order_History.belongsTo(models.Size, {
        foreignKey: "sizeId",
        targetKey: "sizeId",
        as: "SizeOrderDetailData",
      });
    }
  }
  Order_History.init(
    {
      orderId: DataTypes.STRING,
      productId: DataTypes.STRING,
      sizeId: DataTypes.STRING,
      quantity: DataTypes.INTEGER,
      totalPrice: DataTypes.INTEGER,
      statusFeedback: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Order_History",
    }
  );
  return Order_History;
};
