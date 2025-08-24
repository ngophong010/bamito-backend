import { Sequelize, DataTypes, Model } from "sequelize";
import type {Optional, HasManyGetAssociationsMixin} from "sequelize";
import type { User } from "./user.js";
import type { Models } from "./index.js";

interface RoleAttributes {
id: number;
roleId: string;
roleName: string;
}

type RoleCreationAttributes = Optional<RoleAttributes, "id">;

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public roleId!: string;
  public roleName!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  // Association methods
  public getUsers!: HasManyGetAssociationsMixin<User>;
  public static associate(models: Models) {
    // A Role can be assigned to many Users
    Role.hasMany(models.User, {
      foreignKey: "roleId", // This will be an integer FK in the User model
      sourceKey: "id", // It links to the integer PK of this Role model
      as: "users",
    });
  }
}

export default function (sequelize: Sequelize): typeof Role {
  Role.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    roleId: { type: DataTypes.STRING, allowNull: false, unique: true },
    roleName: { type: DataTypes.STRING, allowNull: false },
  }, {
    sequelize,
    modelName: "Role",
    tableName: "roles",
  });
  return Role;
}
