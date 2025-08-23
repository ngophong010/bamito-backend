import { Sequelize, DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";
import type { Models } from "./index.js";

interface CartDetailAttributes {
  id: number;
  quantity: number;
  totalPrice: number;
  cartId: number;
  productId: number;
  sizeId: number;
}

type CartDetailCreationAttributes = Optional<CartDetailAttributes, "id">;

export class CartDetail extends Model<CartDetailAttributes, CartDetailCreationAttributes> implements CartDetailAttributes {
  public id!: number;
  public quantity!: number;
  public totalPrice!: number;
  public cartId!: number;
  public productId!: number;
  public sizeId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: Models) {
    CartDetail.belongsTo(models.Cart, { foreignKey: "cartId" });
    CartDetail.belongsTo(models.Product, { foreignKey: "productId" });
    CartDetail.belongsTo(models.Size, { foreignKey: "sizeId" });
  }
}

export default function (sequelize: Sequelize): typeof CartDetail {
  CartDetail.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    totalPrice: { type: DataTypes.INTEGER, allowNull: false },
    cartId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    sizeId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: "CartDetail",
    tableName: "cart_details",
  });
  return CartDetail;
};
