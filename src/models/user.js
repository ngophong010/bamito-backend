"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Role, {
        foreignKey: "roleId",
        targetKey: "roleId",
        as: "roleData",
      });
      User.hasMany(models.Delivery_Address, {
        foreignKey: "userId",
        as: "deliveryAddressData",
      });
      User.hasMany(models.Order, {
        foreignKey: "userId",
        as: "UserData",
      });
      User.hasMany(models.Feedback, {
        foreignKey: "userId",
        as: "UserFeedbackData",
      });
      User.hasMany(models.Favourite, {
        foreignKey: "userId",
        as: "UserFavouriteData",
      });
    }
  }
  User.init(
    {
      userName: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      avatar: DataTypes.STRING,
      avatarId: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      birthday: DataTypes.STRING,
      otpCode: DataTypes.INTEGER,
      timeOtp: DataTypes.STRING,
      roleId: DataTypes.STRING,
      tokenResgister: DataTypes.STRING,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
