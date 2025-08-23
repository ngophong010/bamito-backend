"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("carts", {
      // ENHANCEMENT 1: 'id' is the one and only primary key.
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // 'cartId' is now a regular column, but it must be unique.
      cartId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // This enforces the business rule efficiently.
      },
      // This foreign key was already correct! We just need to ensure it
      // points to the lowercase 'users' table name.
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users", // The lowercase name of the target table
          key: "id",    // The integer primary key it references
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // When a user is deleted, their cart is also deleted.
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
  },

  async down(queryInterface, Sequelize) {
    // Ensure the 'down' migration also uses the correct table name.
    await queryInterface.dropTable("carts");
  },
};
