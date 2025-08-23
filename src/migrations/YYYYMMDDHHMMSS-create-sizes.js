"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ENHANCEMENT 2: Use the consistent, lowercase table name.
    await queryInterface.createTable("sizes", {
      // ENHANCEMENT 1: 'id' is the single, integer primary key for performance.
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // 'sizeId' is now a regular column, but it must be unique.
      sizeId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // This enforces the business rule.
      },
      // The foreign key is now an efficient INTEGER
      productTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "product_types", // lowercase table name
          key: "id",            // integer primary key
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      sizeName: {
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
    await queryInterface.dropTable("sizes");
  },
};
