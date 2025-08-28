"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("delivery_addresses", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // ENHANCEMENT 1: 'userId' is now just a foreign key, NOT a primary key.
      // This allows a single userId to appear in multiple rows, enabling the
      // one-to-many relationship.
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users", // The lowercase name of the target table
          key: "id",    // The integer primary key it references
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // When a user is deleted, their addresses are deleted.
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // You might want to add other fields here, like:
      // receiverName: { type: Sequelize.STRING, allowNull: false },
      // phone: { type: Sequelize.STRING, allowNull: false },
      // isDefault: { type: Sequelize.BOOLEAN, defaultValue: false },
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
    await queryInterface.dropTable("delivery_addresses");
  },
};