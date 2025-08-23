import { Sequelize, DataTypes, Model} from "sequelize";
import type {Optional, HasManyGetAssociationsMixin, BelongsToGetAssociationMixin } from "sequelize";
import type { OrderHistory } from "./orderHistory.js";
import type { User } from "./user.js";
import type { Voucher } from "./voucher.js";
import type { Models } from "./index.js";

interface OrderAttributes {
  id: number;
  orderId: string;
  userId: number;
  voucherId: number | null;
  totalPrice: number;
  payment: string;
  deliveryAddress: string;
  status: number;
}

type OrderCreationAttributes = Optional<OrderAttributes, "id" | "voucherId">;

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderId!: string;
  public userId!: number;
  public voucherId!: number | null;
  public totalPrice!: number;
  public payment!: string;
  public deliveryAddress!: string;
  public status!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getUser!: BelongsToGetAssociationMixin<User>;
  public getVoucher!: BelongsToGetAssociationMixin<Voucher>;
  public getOrderHistory!: HasManyGetAssociationsMixin<OrderHistory>;

  public static associate(models: Models) {
    Order.belongsTo(models.User, { foreignKey: "userId", as: "userData" });
    Order.belongsTo(models.Voucher, { foreignKey: "voucherId", as: "voucherData" });
    Order.hasMany(models.OrderHistory, { foreignKey: "orderId", as: "orderHistory" });
  }
}

export default function (sequelize: Sequelize): typeof Order {
  Order.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    voucherId: DataTypes.INTEGER,
    totalPrice: { type: DataTypes.INTEGER, allowNull: false },
    payment: { type: DataTypes.STRING, allowNull: false },
    deliveryAddress: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, {
    sequelize,
    modelName: "Order",
    tableName: "orders",
  });
  return Order;
}
