import { Sequelize, DataTypes, Model } from "sequelize";
import type { Optional, HasManyGetAssociationsMixin} from "sequelize";
import type { Product } from "./product.js";
import type { Size } from "./size.js";
import type { Models } from "./index.js";

interface ProductTypeAttributes {
  id: number;
  productTypeId: string;
  productTypeName: string;
}

type ProductTypeCreationAttributes = Optional<ProductTypeAttributes, "id">;

export class ProductType extends Model<ProductTypeAttributes, ProductTypeCreationAttributes> implements ProductTypeAttributes {
  public id!: number;
  public productTypeId!: string;
  public productTypeName!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  // Association methods
  public getProducts!: HasManyGetAssociationsMixin<Product>;
  public getSizes!: HasManyGetAssociationsMixin<Size>;

  public static associate(models: Models) {
    // A ProductType has many Products
    ProductType.hasMany(models.Product, {
      foreignKey: "productTypeId",
      sourceKey: "id",
      as: "products",
    });

    // A ProductType can have many Sizes (e.g., "Clothing" has S, M, L)
    ProductType.hasMany(models.Size, {
      foreignKey: "productTypeId",
      sourceKey: "id",
      as: "sizes",
    });
  }
}

export default function (sequelize: Sequelize): typeof ProductType {
  ProductType.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      productTypeId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      productTypeName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ProductType", // Correct PascalCase name
      tableName: "product_types", // Correct lowercase table name
    }
  );
  return ProductType;
}