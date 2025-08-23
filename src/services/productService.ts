import db from "../models/index.js";
import { Op, Sequelize, where } from "sequelize";
import type { ServiceResponse } from "../types/serviceResponse.js";
import { v2 as cloudinary } from 'cloudinary';

interface ProductData {
  id?: number;
  productId: string;
  brandId: number; // Foreign keys are numbers
  productTypeId: number; // Foreign keys are numbers
  name: string;
  price: number;
  imageUrl?: string;
  imageId?: string;
  descriptionContent?: string;
  descriptionHTML?: string;
  discount?: number;
}

const createNewProductService = async (data: ProductData): Promise<ServiceResponse> => {
  const { productId, brandId, productTypeId, name, price, imageUrl, imageId, descriptionContent, descriptionHTML, discount } = data;

  if (!productId || !brandId || !productTypeId || !name || !price || !imageUrl) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  const existingProduct = await db.Product.findOne({
    where: {
      [Op.or]: [
        { productId: productId },
        { name: name }
      ]
    }
  });

  if (existingProduct) {
    const message = existingProduct.productId === productId
      ? "ProductId already exists"
      : "ProductName already exists";
    return { errCode: 2, message };
  }

  await db.Product.create({
    productId, brandId, productTypeId, name, price,
    image: imageUrl, imageId, descriptionContent, descriptionHTML,
  });

  return { errCode: 0, message: "Product created successfully" };
};

const deleteProductService = async (id: number): Promise<ServiceResponse> => {
  const product = await db.Product.findByPk(id);
  if (!product) {
    return { errCode: 2, message: "Product not found." };
  }

  if (product.imageId) {
    await cloudinary.uploader.destroy(product.imageId);
  }

  await product.destroy();
  return { errCode: 0, message: "Product deleted successfully" };
};

const updateProductService = async (data: ProductData): Promise<ServiceResponse> => {
  const { id, productId, name} = data;
  if (!id || !productId || !name) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  const productToUpdate = await db.Product.findByPk(id);
  if (!productToUpdate) {
    return { errCode: 3, message: "Product not found." };
  }

  const existingProduct = await db.Product.findOne({
    where: {
      [Op.or]: [{ productId }, { name }],
      id: { [Op.ne]: id }, // Exclude the current product from the check
    },
  });

  if (existingProduct) {
    const message = existingProduct.productId === productId
      ? "Another product with this ID already exists."
      : "Another product with this Name already exists.";
    return { errCode: 2, message };
  }

  if (data.imageUrl && data.imageId && productToUpdate.imageId) {
    await cloudinary.uploader.destroy(productToUpdate.imageId);
  }

  await productToUpdate.update(data);
  return { errCode: 0, message: "Product updated successfully." };
};

// Pagination
const getAllProductService = async (limit: number, page: number, sort: string, name: string): Promise<ServiceResponse> => {
  const effectiveLimit = limit || 10;
  const offset = ((page || 1) - 1) * effectiveLimit;
  const whereClause: { name?: any } = {};
  if (name) {
    whereClause.name = { [Op.substring]: name };
  }

  const { count, rows } = await db.Product.findAndCountAll({
    where: whereClause,
    limit: effectiveLimit,
    offset: offset,
    order: [sort ? sort.split(',') : ['id', 'DESC']],
    include: [
      { model: db.Brand, as: "brandData", attributes: ["brandId", "brandName"] },
      { model: db.ProductType, as: "productTypeData", attributes: ["productTypeId", "productTypeName"] },
      // Join with Feedback but don't select any of its columns
      { model: db.Feedback, as: "feedbacks", attributes: [] },
    ],
    attributes: {
      exclude: ["imageId", "descriptionContent", "descriptionHTML"],
      // Use Sequelize to calculate the average rating in the database
      include: [
        [Sequelize.fn('AVG', Sequelize.col('feedbacks.rating')), 'averageRating']
      ]
    },
    group: ['Product.id', 'brandData.id', 'productTypeData.id'], // Group by to make the AVG work
    // Use subQuery: false for complex queries with limits to work correctly 
    subQuery: false,
  });

  return {
    errCode: 0,
    data: {
      totalItems: count.length, // count is an array of objects when grouping
      totalPages: Math.ceil(count.length / effectiveLimit),
      currentPage: page || 1,
      products: rows.map(p => ({ ...p.get({ plain: true }) })), // Sanitize the output
    },
    message: "Products retrieved successfully",
  };
};

const getAllProductOfTheProductTypeService = async(
  productTypeId: number,
  limit: number,
  page: number,
  sort: string,
  filter: FilterOptions
): Promise<ServiceResponse> => {
  if (!productTypeId) {
    return { errCode: 1, message: "Missing required productTypeId parameter!" };
  }
  const effectiveLimit = limit || 12; // A sensible default
  const effectivePage = page || 1;
  const offset = (effectivePage - 1) * effectiveLimit;

  // 2. Dynamically build the 'where' clause for the main query
  const whereClause: any = { productTypeId };
  if (filter?.brandId && filter.brandId.length > 0) {
    whereClause.brandId = { [Op.in]: filter.brandId };
  }
  if (filter?.price && filter.price.length === 2) {
    whereClause.price = { [Op.between]: filter.price };
  }

  // 3. The single, efficient query that solves the N+1 problem
  const { count, rows } = await db.Product.findAndCountAll({
    where: whereClause,
    limit: effectiveLimit,
    offset,
    order: [sort ? sort.split(',') : ['id', 'DESC']],
    // Join with necessary tables
    include: [
      { model: db.Brand, as: "brandData", attributes: ["brandId", "brandName"] },
      { model: db.ProductType, as: "productTypeData", attributes: ["productTypeId", "productTypeName"] },
      // Include Feedbacks but select no columns, just for the aggregation
      { model: db.Feedback, as: "feedbacks", attributes: [] },
    ],
    attributes: {
      exclude: ["createdAt", "updatedAt", "imageId", "brandId", "productTypeId"],
      // Use Sequelize's aggregate functions to calculate the average rating in the database
      include: [
        [Sequelize.fn("AVG", Sequelize.col("feedbacks.rating")), "averageRating"],
      ],
    },
    // Group by the primary keys to make the AVG function work correctly for each product
    group: ["Product.id", "brandData.id", "productTypeData.id"],
    subQuery: false, // Important for correct counting with grouped includes and limits
  });

  // 4. Sanitize the output
  const products = rows.map(product => {
    const plainProduct = product.get({ plain: true });
    // The calculated average is now a property on the object
    plainProduct.rating = parseFloat(plainProduct.averageRating || 0).toFixed(1);
    delete plainProduct.averageRating; // Clean up the temporary field
    return plainProduct;
  });

  return {
    errCode: 0,
    data: {
      totalItems: count.length, // With grouping, count is an array of grouped results
      totalPages: Math.ceil(count.length / effectiveLimit),
      currentPage: effectivePage,
      products: products,
    },
    message: "Products retrieved successfully",
  };
};

const getProductService = async(productId: string): Promise<ServiceResponse> => {
  if (!productId) {
    return { errCode: 1, message: "Missing required productId parameter!" };
  }

  const product = await db.Product.findOne({
     where: { productId: productId },
    // Include all related data directly in the query
    include: [
      {
        model: db.ProductType,
        as: "productTypeData",
        attributes: ["productTypeId", "productTypeName"],
      },
      {
        model: db.Brand,
        as: "brandData",
        attributes: ["brandId", "brandName"],
      },
      // Nested include: Get ProductSizes, and for each one, include its Size data
      {
        model: db.ProductSize,
        as: "productSizes",
        attributes: ["quantity", "sold"],
        include: [{
          model: db.Size,
          as: "sizeData",
          attributes: ["sizeId", "sizeName"],
        }],
      },
      // Include Feedbacks but don't select any columns, just for aggregation
      {
        model: db.Feedback,
        as: "feedbacks",
        attributes: [],
      },
    ],
    attributes: {
      exclude: ["createdAt", "updatedAt", "id", "brandId", "productTypeId", "imageId"],
      // ENHANCEMENT: Calculate average rating and feedback count in the database
      include: [
        [Sequelize.fn("AVG", Sequelize.col("feedbacks.rating")), "averageRating"],
        [Sequelize.fn("COUNT", Sequelize.col("feedbacks.id")), "feedbackCount"],
      ],
    },
    group: [
      "Product.id",
      "productTypeData.id",
      "brandData.id",
      "productSizes.id",
      "productSizes->sizeData.id", // Group by nested included models
    ],
  });

  if (!product) {
    return { errCode: 2, message: "Product not found." };
  }

  const plainProduct = product.get({ plain: true });

  return {
    errCode: 0,
    data: plainProduct,
    message: "Product retrieved successfully",
  };
};

const getAllProuctFeedbackService = async (userId: number): Promise<ServiceResponse> => {
  if (!userId) {
    return { errCode: 1, message: "Missing required userId parameter!" };
  }

  const unreviewedItems = await db.Order_History.findAll({
    // Find all order history items that haven't been reviewed yet
    where: { statusFeedback: 0 },
    // And include their parent Order, but ONLY if that Order matches our criteria
    include: [
      {
        model: db.Order,
        as: "OrderData", // Make sure this alias is defined in your OrderHistory model
        attributes: [], // We don't need any columns from the Order table itself
        where: {
          userId: userId, // The Order must belong to the specified user
          status: 3,      // And the Order status must be "completed"
        },
        required: true, // This makes it an INNER JOIN
      },
      // Now include all the other data you need for the final output
      {
        model: db.Size,
        as: "SizeOrderDetailData",
        attributes: ["sizeId", "sizeName"],
      },
      {
        model: db.Product,
        as: "ProductDetailData",
        attributes: ["image", "name", "price", "discount"],
      },
    ],
    attributes: {
      exclude: ["createdAt", "updatedAt", "id", "sizeId"],
    },
    // The raw/nest combination is great for cleaning up included data
    raw: true,
    nest: true,
  });

  const formattedData = unreviewedItems.map((item) => ({
    productId: item.productId,
    orderId: item.orderId,
    quantity: item.quantity,
    totalPrice: item.totalPrice,
    sizeId: item.SizeOrderDetailData.sizeId,
    sizeName: item.SizeOrderDetailData.sizeName,
    ...item.ProductDetailData, // Spread the product details
  }));

  return {
    errCode: 0,
    data: formattedData,
    message: "Feedbacks retrieved successfully",
  };
};

const getAllProductSaleOffService = async (limit?: number, page?: number): Promise<ServiceResponse> => {
  const effectiveLimit = limit || 12;
  const effectivePage = page || 1;
  const offset = (effectivePage - 1) * effectiveLimit;
  
  const { count, rows } = await db.Product.findAndCountAll({
    where: {
      discount: { [Op.gt]: 0 }, // Only products with a discount greater than 0
    },
    limit: effectiveLimit,
    offset: offset,
    order: [["id", "DESC"]],
    include: [
      { model: db.ProductType, as: "productTypeData", attributes: ["productTypeId", "productTypeName"] },
      { model: db.Brand, as: "brandData", attributes: ["brandId", "brandName"] },
      // Include Feedbacks for aggregation but select no actual columns from it
      { model: db.Feedback, as: "feedbacks", attributes: [] },
    ],
    attributes: {
      exclude: ["createdAt", "updatedAt", "imageId", "brandId", "productTypeId", "descriptionContent", "descriptionHTML"],
      // Use Sequelize's aggregate function to make the DATABASE calculate the average
      include: [
        [Sequelize.fn("AVG", Sequelize.col("feedbacks.rating")), "averageRating"],
      ],
    },
    group: ["Product.id", "productTypeData.id", "brandData.id"], // Group by PKs for correct aggregation
    subQuery: false,
  });

  const products = rows.map(product => {
    const plainProduct = product.get({ plain: true });
    // The calculated average is now a property on the object
    plainProduct.rating = parseFloat(plainProduct.averageRating || 0).toFixed(1);
    delete plainProduct.averageRating; // Clean up the temporary field
    return plainProduct;
  });

  return {
    errCode: 0,
    data: {
      totalItems: count.length, // With grouping, count is an array of grouped results
      totalPages: Math.ceil(count.length / effectiveLimit),
      currentPage: effectivePage,
      products: products,
    },
    message: "Products on sale retrieved successfully",
  };
};

const getAllProductFavouriteService = async (userId:number, limit?: number, page?: number): Promise<ServiceResponse> => {
  if (!userId) {
    return { errCode: 1, message: "Missing required userId parameter!" };
  }

  const effectiveLimit = limit || 12;
  const effectivePage = page || 1;
  const offset = (effectivePage - 1) * effectiveLimit;

  const { count, rows } = await db.Favourite.findAndCountAll({
    where: { userId },
    limit: effectiveLimit,
    offset,
    order: [["id", "DESC"]],
    // We only need the Product data, so we can exclude the Favourite's own attributes
    attributes: [],
    include: [
      {
        model: db.Product,
        as: "ProductFavouriteData", // Use the alias defined in your Favourite model
        // This is a nested include to get all necessary data in one go
        include: [
          { model: db.ProductType, as: "productTypeData", attributes: ["productTypeId", "productTypeName"] },
          { model: db.Brand, as: "brandData", attributes: ["brandId", "brandName"] },
          { model: db.Feedback, as: "feedbacks", attributes: [] },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt", "imageId", "brandId", "productTypeId", "descriptionContent", "descriptionHTML"],
          // Perform the aggregation on the nested model
          include: [
            [Sequelize.fn("AVG", Sequelize.col("ProductFavouriteData->feedbacks.rating")), "averageRating"],
          ],
        },
      },
    ],
    group: [
      "Favourite.id",
      "ProductFavouriteData.id",
      "ProductFavouriteData->productTypeData.id",
      "ProductFavouriteData->brandData.id",
    ],
    subQuery: false,
  });

   const products = rows.map(favourite => {
    const plainProduct = favourite.ProductFavouriteData.get({ plain: true });
    plainProduct.rating = parseFloat(plainProduct.averageRating || 0).toFixed(1);
    delete plainProduct.averageRating;
    return plainProduct;
  });

  return {
    errCode: 0,
    data: {
      totalItems: count.length, // With grouping, count is an array of grouped results
      totalPages: Math.ceil(count.length / effectiveLimit),
      currentPage: effectivePage,
      products: products,
    },
    message: "Favourite products retrieved successfully",
  };
};

export {
  createNewProductService,
  deleteProductService,
  updateProductService,
  getAllProductService,
  getProductService,
  getAllProductOfTheProductTypeService,
  getAllProuctFeedbackService,
  getAllProductSaleOffService,
  getAllProductFavouriteService,
};
