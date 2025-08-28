"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      productId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      productTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "product_types",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      brandId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "brands",
          key: "id",
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
    await queryInterface.dropTable("products");
  },
};
