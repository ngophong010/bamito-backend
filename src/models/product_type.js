"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product_Type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product_Type.hasMany(models.Product, {
        foreignKey: "productTypeId",
        as: "productTypeData",
      });
      Product_Type.hasMany(models.Size, {
        foreignKey: "productTypeId",
        as: "productTypeSizeData",
      });
    }
  }
  Product_Type.init(
    {
      productTypeId: DataTypes.STRING,
      productTypeName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Product_Type",
    }
  );
  return Product_Type;
};
