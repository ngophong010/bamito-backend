"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ENHANCEMENT 2: Use the consistent, lowercase table name.
    await queryInterface.createTable("users", {
      // The primary key is already correct, which is excellent.
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      avatarId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // ENHANCEMENT 1: Use the correct DATEONLY type for a birthday.
      birthday: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      otpCode: {
        type: Sequelize.STRING, // OTPs are often strings to handle leading zeros, e.g., "012345"
        allowNull: true,
      },
      // ENHANCEMENT 1: Use the correct DATE type for an expiration timestamp.
      timeOtp: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      // ENHANCEMENT 1: The foreign key is now an efficient INTEGER.
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "roles", // lowercase table name
          key: "id",    // integer primary key
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tokenRegister: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable("users");
  },
};
