"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.belongsTo(models.Product_Type, {
        foreignKey: "productTypeId",
        targetKey: "productTypeId",
        as: "productTypeData",
      });
      Product.belongsTo(models.Brand, {
        foreignKey: "brandId",
        targetKey: "brandId",
        as: "brandData",
      });
      Product.hasMany(models.Product_Size, {
        foreignKey: "productId",
        as: "ProductSizeData",
      });
      Product.hasMany(models.Cart_Detail, {
        foreignKey: "productId",
        as: "ProductData",
      });
      Product.hasMany(models.Order_History, {
        foreignKey: "productId",
        as: "ProductDetailData",
      });
      Product.hasMany(models.Favourite, {
        foreignKey: "productId",
        as: "ProductFavouriteData",
      });
    }
  }
  Product.init(
    {
      productId: DataTypes.STRING,
      brandId: DataTypes.STRING,
      productTypeId: DataTypes.STRING,
      name: DataTypes.STRING,
      image: DataTypes.STRING,
      imageId: DataTypes.STRING,
      price: DataTypes.INTEGER,
      discount: DataTypes.INTEGER,
      rating: DataTypes.INTEGER,
      descriptionContent: DataTypes.TEXT("long"),
      descriptionHTML: DataTypes.TEXT("long"),
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
