"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("favourites", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Apply the business rule as a UNIQUE constraint enforces "one favourite per user per product"
    // while keeping the primary key simple and performant.
    await queryInterface.addConstraint("favourites", {
      fields: ["userId", "productId"],
      type: "unique",
      name: "unique_user_product_favourite_constraint",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("favourites");
  },
};
