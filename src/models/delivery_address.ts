import { Sequelize, DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";
import type { Models } from "./index.js";

interface DeliveryAddressAttributes {
  id: number;
  userId: number;
  address: string;
}

type DeliveryAddressCreationAttributes = Optional<DeliveryAddressAttributes, "id">;

export class DeliveryAddress extends Model<DeliveryAddressAttributes, DeliveryAddressCreationAttributes> implements DeliveryAddressAttributes {
  public id!: number;
  public userId!: number;
  public address!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: Models) {
    // An Address belongs to one User
    DeliveryAddress.belongsTo(models.User, {
      foreignKey: "userId",
      as: "userData",
    });
  }
}

export default function (sequelize: Sequelize): typeof DeliveryAddress {
  DeliveryAddress.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
  }, {
    sequelize,
    modelName: "DeliveryAddress",
    tableName: "delivery_addresses",
  });
  return DeliveryAddress;
}
