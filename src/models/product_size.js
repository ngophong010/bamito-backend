"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product_Size extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product_Size.belongsTo(models.Product, {
        foreignKey: "productId",
        targetKey: "productId",
        as: "ProductSizeData",
      });
      Product_Size.belongsTo(models.Size, {
        foreignKey: "sizeId",
        targetKey: "sizeId",
        as: "SizeData",
      });
    }
  }
  Product_Size.init(
    {
      sizeId: DataTypes.STRING,
      productId: DataTypes.STRING,
      quantity: DataTypes.INTEGER,
      sold: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Product_Size",
    }
  );
  return Product_Size;
};
