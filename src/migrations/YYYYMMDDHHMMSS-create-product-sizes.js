"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("product_sizes", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
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

    // Apply the business rule as a UNIQUE constraint enforces "one unique product per size"
    // while keeping the primary key simple and performant.
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
