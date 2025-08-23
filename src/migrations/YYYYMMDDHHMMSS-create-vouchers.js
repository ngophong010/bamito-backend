"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ENHANCEMENT 3: Use the consistent, lowercase table name.
    await queryInterface.createTable("vouchers", {
      // ENHANCEMENT 2: 'id' is the single, integer primary key for performance.
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // 'voucherId' is now a regular column, but it must be unique.
      voucherId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // This enforces the business rule.
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      imageId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      voucherPrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      // ENHANCEMENT 1: Use the correct DATE type for time-based data.
      timeStart: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      timeEnd: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("vouchers");
  },
};
