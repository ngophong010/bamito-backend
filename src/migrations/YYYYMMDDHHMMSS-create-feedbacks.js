"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("feedbacks", {
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
      description: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
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

    // Apply the business rule as a UNIQUE constraint  enforces "one feedback per user per product"
    // while keeping the primary key simple and performant.
    await queryInterface.addConstraint("feedbacks", {
      fields: ["userId", "productId"],
      type: "unique",
      name: "unique_user_product_feedback_constraint",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("feedbacks");
  },
};
