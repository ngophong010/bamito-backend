"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ENHANCEMENT 2: Use the consistent, lowercase table name.
    await queryInterface.createTable("feedbacks", {
      // ENHANCEMENT 1: 'id' is the single, integer primary key.
      // This is the most efficient structure for the database.
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
          key: "id", // integer primary key
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "products", // lowercase table name
          key: "id", // integer primary key
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
        allowNull: false, // A feedback should always have a rating
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
    // This enforces "one feedback per user per product" while keeping the
    // primary key simple and performant.
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