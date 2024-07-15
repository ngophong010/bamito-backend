"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Sizes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        unique: true,
        type: Sequelize.INTEGER,
      },
      sizeId: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      productTypeId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Product_Types",
          key: "productTypeId",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
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
    await queryInterface.dropTable("Sizes");
  },
};
