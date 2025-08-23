import { Sequelize, DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

import type { Models } from "./index.js";

interface ProductSizeAttributes {
  id: number;
  quantity: number;
  sold: number;

  // Foreign Keys
  productId: number;
  sizeId: number;
}

type ProductSizeCreationAttributes = Optional<ProductSizeAttributes, "id" | "sold">;
export class ProductSize extends Model<ProductSizeAttributes, ProductSizeCreationAttributes> implements ProductSizeAttributes {
  public id!: number;
  public quantity!: number;
  public sold!: number;

  // Foreign Keys
  public productId!: number;
  public sizeId!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ProductSize {
  ProductSize.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      // ENHANCEMENT 1: Foreign keys are now efficient INTEGERS
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "products", // The lowercase table name
          key: "id",       // The integer primary key it references
        },
      },
      sizeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "sizes", // The lowercase table name
          key: "id",      // The integer primary key it references
        },
      },
    },
    {
      sequelize,
      modelName: "ProductSize", // ENHANCEMENT 2: Correct PascalCase name
      tableName: "product_sizes",
      timestamps: true, // Join tables should have timestamps
    }
  );
  return ProductSize;
};
