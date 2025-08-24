// This script populates the database with realistic fake data for development.
import { faker } from '@faker-js/faker';
import db, { sequelize } from '../src/models/index.js';

const createFakeProducts = async (count: number) => {
  console.log(`Creating ${count} fake products...`);
  const brands = await db.Brand.findAll();
  const productTypes = await db.ProductType.findAll();

  if (brands.length === 0 || productTypes.length === 0) {
    console.error("Please seed brands and product types first!");
    return;
  }

  for (let i = 0; i < count; i++) {
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    const randomType = productTypes[Math.floor(Math.random() * productTypes.length)];
    
    await db.Product.create({
      productId: `PROD-${faker.string.alphanumeric(10).toUpperCase()}`,
      name: `Vợt Cầu Lông ${randomBrand.brandName} ${faker.commerce.productName()}`,
      price: faker.number.int({ min: 500000, max: 5000000 }),
      descriptionHTML: `<p>${faker.lorem.paragraphs(3)}</p>`,
      brandId: randomBrand.id,
      productTypeId: randomType.id,
      image: faker.image.urlLoremFlickr({ category: 'sports' }),
    });
  }
  console.log("Finished creating products.");
};

const run = async () => {
  await createFakeProducts(50); // Create 50 fake products
  // You can create more functions here for fake users, fake orders, etc.
  
  await sequelize.close(); // Close the connection
};

run();