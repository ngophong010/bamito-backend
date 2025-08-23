import { Sequelize, DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";
import type { Models } from "./index.js";

interface FeedbackAttributes {
  id: number;
  userId: number;
  productId: number;
  description: string | null;
  rating: number;
}

type FeedbackCreationAttributes = Optional<FeedbackAttributes, "id" | "description">;

export class Feedback extends Model<FeedbackAttributes, FeedbackCreationAttributes> implements FeedbackAttributes {
  public id!: number;
  public userId!: number;
  public productId!: number;
  public description!: string | null;
  public rating!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: Models) {
    Feedback.belongsTo(models.User, { foreignKey: "userId" });
    Feedback.belongsTo(models.Product, { foreignKey: "productId" });
  }
}

export default function (sequelize: Sequelize): typeof Feedback {
  Feedback.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    description: DataTypes.TEXT,
    rating: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: "Feedback",
    tableName: "feedbacks",
  });
  return Feedback;
}