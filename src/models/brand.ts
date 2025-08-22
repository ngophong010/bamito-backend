import {
  Sequelize,
  DataTypes,
  Model,
} from "sequelize";
import type {
  Optional,
  HasManyAddAssociationMixin,
  HasManyGetAssociationsMixin,
} from "sequelize";
import type { Product } from "./product.js";
import type { Models } from "./index.js";

interface BrandAttributes {
  id: number;
  brandId: string;
  brandName: string;
}

type BrandCreationAttributes = Optional<BrandAttributes, "id">;

export class Brand extends Model<
  BrandAttributes,
  BrandCreationAttributes
> implements BrandAttributes {
  public id!: number;
  public brandId!: string;
  public brandName!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public addProduct!: HasManyAddAssociationMixin<Product, number>;
  public getProducts!: HasManyGetAssociationsMixin<Product>;

  static associate(models: Models) {
    Brand.hasMany(models.Product, {
      foreignKey: "brandId",
      sourceKey: "id",
      as: "products",
    });
  }
}

export default function (sequelize: Sequelize): typeof Brand {
  Brand.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      brandId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      brandName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Brand",
      tableName: "brands",
      timestamps: true, // Enable createdAt and updatedAt
    }
  );

  return Brand;
}
