import { Sequelize, DataTypes, Model} from "sequelize";
import type { Optional } from "sequelize";
import type { Models } from "./index.js";

interface VoucherAttributes {
  id: number;
  voucherId: string;
  image: string | null;
  imageId: string | null;
  voucherPrice: number;
  quantity: number;
  timeStart: Date;
  timeEnd: Date;
}

type VoucherCreationAttributes = Optional<VoucherAttributes, "id" | "image" | "imageId">;

export class Voucher extends Model<VoucherAttributes, VoucherCreationAttributes> implements VoucherAttributes {
  public id!: number;
  public voucherId!: string;
  public image!: string | null;
  public imageId!: string | null;
  public voucherPrice!: number;
  public quantity!: number;
  public timeStart!: Date;
  public timeEnd!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  // Add associations here if a Voucher belongs to a User, etc.
  // public static associate(models: Models) { ... }
}

export default function (sequelize: Sequelize): typeof Voucher {
  Voucher.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    voucherId: { type: DataTypes.STRING, allowNull: false, unique: true },
    image: DataTypes.STRING,
    imageId: DataTypes.STRING,
    voucherPrice: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    // Use the correct DATE type in the model as well
    timeStart: { type: DataTypes.DATE, allowNull: false },
    timeEnd: { type: DataTypes.DATE, allowNull: false },
  }, {
    sequelize,
    modelName: "Voucher",
    tableName: "vouchers",
  });
  return Voucher;
}
