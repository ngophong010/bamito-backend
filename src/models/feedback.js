"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Feedback.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
        as: "UserFeedbackData",
      });
    }
  }
  Feedback.init(
    {
      userId: DataTypes.INTEGER,
      productId: DataTypes.STRING,
      description: DataTypes.TEXT,
      rating: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Feedback",
    }
  );
  return Feedback;
};
