"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Size extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Size.belongsTo(models.Product_Type, {
        foreignKey: "productTypeId",
        targetKey: "productTypeId",
        as: "productTypeSizeData",
      });
      Size.hasMany(models.Product_Size, {
        foreignKey: "sizeId",
        as: "SizeData",
      });
      Size.hasMany(models.Cart_Detail, {
        foreignKey: "sizeId",
        as: "CartDetailSizeData",
      });
      Size.hasMany(models.Order_History, {
        foreignKey: "sizeId",
        as: "SizeOrderDetailData",
      });
    }
  }
  Size.init(
    {
      sizeId: DataTypes.STRING,
      productTypeId: DataTypes.STRING,
      sizeName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Size",
    }
  );
  return Size;
};
