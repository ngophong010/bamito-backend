"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ENHANCEMENT 3: Use the lowercase, plural table name
    await queryInterface.createTable("cart_details", {
      // ENHANCEMENT 1: 'id' is the single, integer primary key
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // ENHANCEMENT 2: Foreign keys are now efficient INTEGERS
      cartId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "carts", // The lowercase name of the target table
          key: "id",      // The integer primary key it references
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // When a cart is deleted, its details are also deleted
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      sizeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sizes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1, // Quantity should never be null, default to 1
      },
      totalPrice: {
        type: Sequelize.INTEGER,
        allowNull: false, // Price should not be null
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Optional but recommended: Add a unique constraint to prevent duplicates
    // This enforces the business rule of the original composite key, but efficiently.
    await queryInterface.addConstraint("cart_details", {
      fields: ["cartId", "productId", "sizeId"],
      type: "unique",
      name: "unique_cart_product_size_constraint",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("cart_details");
  },
};