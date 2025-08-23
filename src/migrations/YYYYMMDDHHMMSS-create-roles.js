"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ENHANCEMENT 2: Use the consistent, lowercase table name.
    await queryInterface.createTable("roles", {
      // ENHANCEMENT 1: 'id' is the single, integer primary key for performance.
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // 'roleId' is now a regular column, but it must be unique.
      roleId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // This enforces the business rule (e.g., 'R1', 'R2').
      },
      roleName: {
        type: Sequelize.STRING,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("roles");
  },
};
