import { Sequelize, DataTypes, Model } from "sequelize";
import type { Optional, HasManyGetAssociationsMixin, BelongsToGetAssociationMixin } from "sequelize";
import type { Role } from "./role.js";
import type { Order } from "./order.js";
import type { Models } from "./index.js";
import * as bcrypt from 'bcrypt';

interface UserAttributes {
  id: number;
  userName: string;
  password?: string; // Make password optional so it's not always returned in queries
  email: string;
  avatar: string | null;
  avatarId: string | null;
  phoneNumber: string | null;
  birthday: Date | null;
  otpCode: string | null;
  timeOtp: Date | null;
  roleId: number;
  tokenRegister: string | null;
  status: number;
}

// Omit password from creation attributes if it's handled by a hook
type UserCreationAttributes = Optional<UserAttributes, "id" | "avatar" | "avatarId" | "phoneNumber" | "birthday" | "otpCode" | "timeOtp" | "tokenRegister" | "status" | "password">;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public userName!: string;
  public password!: string;
  public email!: string;
  public avatar!: string | null;
  public avatarId!: string | null;
  public phoneNumber!: string | null;
  public birthday!: Date | null;
  public otpCode!: string | null;
  public timeOtp!: Date | null;
  public roleId!: number;
  public tokenRegister!: string | null;
  public status!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getRoleData!: BelongsToGetAssociationMixin<Role>;
  public getOrders!: HasManyGetAssociationsMixin<Order>;

  // A method to check password
  public validPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }

  public static associate(models: Models) {
    User.belongsTo(models.Role, { foreignKey: "roleId", targetKey: "id", as: "roleData" });
    User.belongsToMany(models.Product, {
      through: models.Favourite, // This is the join table
      foreignKey: "userId",
      otherKey: "productId",
      as: "favouriteProducts", // A clear alias
    });
    User.hasMany(models.Order, { foreignKey: "userId", as: "orders" });
    // ... other associations like hasOne Cart, hasMany Feedbacks
  }
}

export default function (sequelize: Sequelize): typeof User {
  User.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userName: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    avatar: DataTypes.STRING,
    avatarId: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    birthday: DataTypes.DATEONLY,
    otpCode: DataTypes.STRING,
    timeOtp: DataTypes.DATE,
    roleId: { type: DataTypes.INTEGER, allowNull: false },
    tokenRegister: DataTypes.STRING,
    status: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, {
    sequelize,
    modelName: "User",
    tableName: "users",
    hooks: {
      // Best practice: Automatically hash password before creating or updating a user
      beforeSave: async (user, options) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
    // Best practice: Exclude password from default queries
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
      },
    },
  });
  return User;
}
