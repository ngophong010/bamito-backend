"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cart_Detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Cart_Detail.belongsTo(models.Product, {
        foreignKey: "productId",
        targetKey: "productId",
        as: "ProductData",
      });
      Cart_Detail.belongsTo(models.Size, {
        foreignKey: "sizeId",
        targetKey: "sizeId",
        as: "CartDetailSizeData",
      });
    }
  }
  Cart_Detail.init(
    {
      cartId: DataTypes.STRING,
      productId: DataTypes.STRING,
      sizeId: DataTypes.STRING,
      quantity: DataTypes.INTEGER,
      totalPrice: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Cart_Detail",
    }
  );
  return Cart_Detail;
};
