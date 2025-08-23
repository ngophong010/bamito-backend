import { Sequelize, DataTypes, Model } from "sequelize";
import type {Optional} from "sequelize";
import type { Models } from "./index.js";

interface OrderHistoryAttributes {
  id: number;
  orderId: number;
  productId: number;
  sizeId: number;
  quantity: number;
  totalPrice: number;
  statusFeedback: number;
}

type OrderHistoryCreationAttributes = Optional<OrderHistoryAttributes, "id">;

export class OrderHistory extends Model<OrderHistoryAttributes, OrderHistoryCreationAttributes> implements OrderHistoryAttributes {
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public sizeId!: number;
  public quantity!: number;
  public totalPrice!: number;
  public statusFeedback!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: Models) {
    OrderHistory.belongsTo(models.Order, { foreignKey: "orderId" });
    OrderHistory.belongsTo(models.Product, { foreignKey: "productId", as: "ProductDetailData" });
    OrderHistory.belongsTo(models.Size, { foreignKey: "sizeId", as: "SizeOrderDetailData" });
  }
}

export default function (sequelize: Sequelize): typeof OrderHistory {
  OrderHistory.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    sizeId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    totalPrice: { type: DataTypes.INTEGER, allowNull: false },
    statusFeedback: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, {
    sequelize,
    modelName: "OrderHistory",
    tableName: "order_histories",
  });
  return OrderHistory;
}