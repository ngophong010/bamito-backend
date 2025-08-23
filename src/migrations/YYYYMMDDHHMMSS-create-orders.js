"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ENHANCEMENT 2: Use the consistent, lowercase table name.
    await queryInterface.createTable("orders", {
      // ENHANCEMENT 1: 'id' is the single, integer primary key for performance.
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // 'orderId' is now a regular column, but it must be unique.
      orderId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // This enforces the business rule.
      },
      // Foreign keys are now all efficient INTEGERS
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users", // lowercase table name
          key: "id",    // integer primary key
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      voucherId: {
        type: Sequelize.INTEGER,
        allowNull: true, // An order might not have a voucher
        references: {
          model: "vouchers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // If a voucher is deleted, don't delete the order
      },
      totalPrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      payment: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deliveryAddress: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // e.g., 0: Pending, 1: Confirmed, 2: Shipped, 3: Delivered
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
    await queryInterface.dropTable("orders");
  },
};
