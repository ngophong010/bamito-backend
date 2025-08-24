'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('brands', [
      { brandId: 'ADI', brandName: 'Adidas', createdAt: new Date('2023-11-06 00:47:47'), updatedAt: new Date('2023-11-06 00:47:47') },
      { brandId: 'FEL', brandName: 'Felet', createdAt: new Date('2023-11-06 00:50:10'), updatedAt: new Date('2023-11-06 00:50:10') },
      { brandId: 'KAM', brandName: 'Kamito', createdAt: new Date('2023-11-06 00:49:40'), updatedAt: new Date('2023-11-06 00:49:40') },
      { brandId: 'KAW', brandName: 'Kawasaki', createdAt: new Date('2023-11-06 00:46:36'), updatedAt: new Date('2023-11-06 00:46:36') },
      { brandId: 'KUM', brandName: 'Kumpoo', createdAt: new Date('2023-11-06 00:46:57'), updatedAt: new Date('2023-11-06 00:46:57') },
      { brandId: 'LN', brandName: 'Lining', createdAt: new Date('2023-11-06 00:45:04'), updatedAt: new Date('2023-11-06 00:45:04') },
      { brandId: 'MIZ', brandName: 'Mizuno', createdAt: new Date('2023-11-06 00:48:44'), updatedAt: new Date('2023-11-06 00:48:53') },
      { brandId: 'VNB', brandName: 'VNB', createdAt: new Date('2023-12-14 22:15:41'), updatedAt: new Date('2023-12-14 22:15:41') }, // Corrected the messy business key
      { brandId: 'VIC', brandName: 'Victor', createdAt: new Date('2023-11-06 00:45:46'), updatedAt: new Date('2023-11-06 00:45:46') },
      { brandId: 'YN', brandName: 'Yonex', createdAt: new Date('2023-11-06 00:44:13'), updatedAt: new Date('2023-11-06 00:44:13') }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('brands', null, {});
  }
};
