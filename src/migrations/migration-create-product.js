"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        unique: true,
        type: Sequelize.INTEGER,
      },
      productId: {
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
      brandId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Brands",
          key: "brandId",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      imageId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      discount: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      rating: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      descriptionContent: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },
      descriptionHTML: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
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
    await queryInterface.dropTable("Products");
  },
};
