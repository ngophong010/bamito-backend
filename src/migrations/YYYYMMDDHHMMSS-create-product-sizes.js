"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ENHANCEMENT 2: Use the consistent, lowercase table name.
    await queryInterface.createTable("product_sizes", {
      // ENHANCEMENT 1: 'id' is the single, integer primary key for performance.
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // Foreign keys are now all efficient INTEGERS
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "products", // lowercase table name
          key: "id",       // integer primary key
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      sizeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sizes", // lowercase table name
          key: "id",      // integer primary key
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    // This enforces "one unique product per size" while keeping the
    // primary key simple and performant.
    await queryInterface.addConstraint("product_sizes", {
      fields: ["productId", "sizeId"],
      type: "unique",
      name: "unique_product_size_constraint",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("product_sizes");
  },
};
