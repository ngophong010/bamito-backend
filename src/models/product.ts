import {
  Sequelize,
  DataTypes,
  Model,
} from "sequelize";
import type {
  Optional,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
} from "sequelize";
import type { Brand } from "./brand.js";
import type { ProductType } from "./productType.js";
import type { ProductSize } from "./productSize.js";
import type { Models } from "./index.js";

export interface ProductAttributes {
  id: number;
  productId: string; // The unique business key
  name: string;
  image: string | null;
  imageId: string | null;
  price: number;
  discount: number;
  rating: number;
  descriptionContent: string | null;
  descriptionHTML: string | null;

  // Foreign Keys
  brandId: number;
  productTypeId: number;
}

type ProductCreationAttributes = Optional<ProductAttributes, "id" | "image" | "imageId" | "descriptionContent" | "descriptionHTML">;

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public productId!: string;
  public name!: string;
  public image!: string | null;
  public imageId!: string | null;
  public price!: number;
  public discount!: number;
  public rating!: number;
  public descriptionContent!: string | null;
  public descriptionHTML!: string | null;

  // Foreign Keys
  public brandId!: number;
  public productTypeId!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public getBrandData!: BelongsToGetAssociationMixin<Brand>;
  public getProductTypeData!: BelongsToGetAssociationMixin<ProductType>;
  public getProductSizes!: HasManyGetAssociationsMixin<ProductSize>;

  static associate(models: Models) {
    Product.belongsTo(models.ProductType, {
      foreignKey: "productTypeId",
      targetKey: "id",
      as: "productTypeData",
    });
    Product.belongsTo(models.Brand, {
      foreignKey: "brandId",
      targetKey: "id",
      as: "brandData",
    });
    Product.belongsToMany(models.Size, {
      through: models.ProductSize, // The name of the join table model
      foreignKey: "productId",     // The key in ProductSize that points to Product
      otherKey: "sizeId",          // The key in ProductSize that points to Size
      as: "sizes",                 // The alias to use when querying
    });
    Product.belongsToMany(models.User, {
      through: models.Favourite,
      foreignKey: "productId",
      otherKey: "userId",
      as: "favouritedByUsers",
    });
    Product.hasMany(models.Feedback, {
      foreignKey: "productId",
      as: "feedbacks",
    });
  }
}

export default function (sequelize: Sequelize): typeof Product {
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      productId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      imageId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      discount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
      },
      descriptionContent: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      descriptionHTML: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      brandId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "brands", key: "id" },
      },
      productTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "product_types", key: "id" },
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
    }
  );
  return Product;
};
