"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Favourite extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Favourite.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
        as: "UserFavouriteData",
      });
      Favourite.belongsTo(models.Product, {
        foreignKey: "productId",
        targetKey: "productId",
        as: "ProductFavouriteData",
      });
    }
  }
  Favourite.init(
    {
      userId: DataTypes.INTEGER,
      productId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Favourite",
    }
  );
  return Favourite;
};
