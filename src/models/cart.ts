import { Sequelize, DataTypes, Model } from "sequelize";
import type { Optional, HasManyGetAssociationsMixin, BelongsToGetAssociationMixin } from "sequelize";
import type { CartDetail } from "./cart_detail.js";
import type { User } from "./user.js"
import type {Models} from "./index.js"

interface CartAtrributes {
  id: number;
  cartId: string;
  userId: string;
}

type CartCreationAttributes = Optional<CartAtrributes, "id">;

export class Cart extends Model<CartAtrributes, CartCreationAttributes> implements CartAtrributes {
  public id!: number;
  public cartId!: string;
  public userId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getUser!: BelongsToGetAssociationMixin<User>;
  public getCartDetails!: HasManyGetAssociationsMixin<CartDetail>;

  public static associate(models: Models){
    Cart.belongsTo(models.User, {
      foreignKey: "userId",
      targetKey: "id",
      as: "userData",
    });

     Cart.hasMany(models.CartDetail, {
      foreignKey: "cartId",
      sourceKey: "id",
      as: "cartDetails",
    });
  }
}

export default function (sequelize: Sequelize): typeof Cart {
  Cart.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cartId: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: "Cart",
    tableName: "carts",
  });
  return Cart;
};
