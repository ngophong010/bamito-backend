"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Cart_Details", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
      },
      cartId: {
        allowNull: false,
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: "Carts",
          key: "cartId",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      productId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        references: {
          model: "Products",
          key: "productId",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      sizeId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        references: {
          model: "Sizes",
          key: "sizeId",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      quantity: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      totalPrice: {
        allowNull: true,
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("Cart_Details");
  },
};
