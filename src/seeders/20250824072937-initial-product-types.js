'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('product_types', [
      {
        productTypeId: 'RACKET', // Clean, professional business key
        productTypeName: 'Vợt cầu lông',
        createdAt: new Date('2023-11-19 12:37:49'),
        updatedAt: new Date('2023-11-19 12:37:49')
      },
      {
        productTypeId: 'SHOES',
        productTypeName: 'Giày cầu lông',
        createdAt: new Date('2023-11-19 12:38:05'),
        updatedAt: new Date('2023-11-19 12:38:05')
      },
      {
        productTypeId: 'SHIRT',
        productTypeName: 'Áo cầu lông',
        createdAt: new Date('2023-11-19 12:38:10'),
        updatedAt: new Date('2023-11-19 12:38:10')
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
