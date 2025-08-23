"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ENHANCEMENT 2: Use the consistent, lowercase table name.
    await queryInterface.createTable("favourites", {
      // ENHANCEMENT 1: 'id' is the single, integer primary key for performance.
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // Foreign keys are now both efficient INTEGERS
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users", // lowercase table name
          key: "id",    // integer primary key
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
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
    // This enforces "one favourite per user per product" while keeping the
    // primary key simple and performant.
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
