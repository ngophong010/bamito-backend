import { Sequelize, DataTypes, Model } from "sequelize";
import type { Optional, BelongsToManyGetAssociationsMixin } from "sequelize";
import type { Product } from "./product.js";
import type { Models } from "./index.js";
import type { ProductType } from "./productType.js";

interface SizeAttributes {
  id: number;
  sizeId: string; // The unique business key (e.g., "S", "M", "40")
  sizeName: string;

  // Foreign Key
  productTypeId: number;
}

type SizeCreationAttributes = Optional<SizeAttributes, "id">;

export class Size extends Model<SizeAttributes, SizeCreationAttributes> implements SizeAttributes {
  public id!: number;
  public sizeId!: string;
  public sizeName!: string;

  // Foreign Key
  public productTypeId!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods
  public getProducts!: BelongsToManyGetAssociationsMixin<Product>;

  static associate(models: Models) {
    Size.belongsTo(models.ProductType, {
      foreignKey: "productTypeId",
      targetKey: "id",
      as: "productType", // A cleaner alias
    });

    // A Size can be on many Products, through the ProductSize table
    // ENHANCEMENT 3: Define the full Many-to-Many relationship
    Size.belongsToMany(models.Product, {
      through: models.ProductSize, // The name of the join table model
      foreignKey: "sizeId",        // The integer FK in ProductSize that points to this model
      otherKey: "productId",     // The integer FK in ProductSize that points to the other model
      as: "products",
    });

    // Define other relationships (e.g., with CartDetail) similarly with integer keys
    Size.hasMany(models.CartDetail, {
        foreignKey: "sizeId",
        sourceKey: "id",
        as: "cartDetails",
    });

    
  }
}

export default function (sequelize: Sequelize): typeof Size {
  Size.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sizeId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // The business key must be unique
      },
      sizeName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // The foreign key column definition
      productTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "product_types", // The lowercase table name
          key: "id",            // The integer PK it references
        },
      },
    },
    {
      sequelize,
      modelName: "Size",
      tableName: "sizes",
    }
  );
  return Size;
};
