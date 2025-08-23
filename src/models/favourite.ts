import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import type { Models } from "./index.js";

// This is a simple join table model.
interface FavouriteAttributes {
  id: number;
  userId: number;
  productId: number;
}

type FavouriteCreationAttributes = Optional<FavouriteAttributes, "id">;

export class Favourite extends Model<FavouriteAttributes, FavouriteCreationAttributes> implements FavouriteAttributes {
  public id!: number;
  public userId!: number;
  public productId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: Models) {
    // It's good practice for join tables to belong to their parent tables.
    Favourite.belongsTo(models.User, { foreignKey: "userId" });
    Favourite.belongsTo(models.Product, { foreignKey: "productId" });
  }
}

export default function (sequelize: Sequelize): typeof Favourite {
  Favourite.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: "Favourite",
    tableName: "favourites",
  });
  return Favourite;
}
