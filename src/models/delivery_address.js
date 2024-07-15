"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Delivery_Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Delivery_Address.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
        as: "deliveryAddressData",
      });
    }
  }
  Delivery_Address.init(
    {
      userId: DataTypes.INTEGER,
      address: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Delivery_Address",
    }
  );
  return Delivery_Address;
};
