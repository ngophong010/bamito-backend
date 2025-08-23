"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ENHANCEMENT 2: Use the consistent, lowercase table name.
    await queryInterface.createTable("order_histories", {
      // ENHANCEMENT 1: 'id' is the single, integer primary key for performance.
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // Foreign keys are now all efficient INTEGERS
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "orders", // lowercase table name
          key: "id",     // integer primary key
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      },
      totalPrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      statusFeedback: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // 0 = not reviewed, 1 = reviewed
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

    // ENHANCEMENT 1 (Part 2): Apply the business rule as a UNIQUE constraint.
    // This enforces "one unique product/size combination per order" efficiently.
    await queryInterface.addConstraint("order_histories", {
      fields: ["orderId", "productId", "sizeId"],
      type: "unique",
      name: "unique_order_product_size_constraint",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("order_histories");
  },
};
