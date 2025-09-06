import { Sequelize} from "sequelize";
import db from "../models/index.js";
import { Favourite } from "../models/favourite.js";
import type { ServiceResponse } from "../types/serviceResponse.js";
import type {  FavouriteWithProduct, ProductWithRatingAttributes } from "../types/shared.js";

// Define the shape of the data for type safety
interface FavouriteData {
  userId: number;
  productId: number;
}

/**
 * @desc    Adds a product to a user's favourites list. Prevents duplicates.
 * @param   {FavouriteData} data - Contains userId and productId
 * @returns {Promise<ServiceResponse>}
 */
const createNewFavouriteService = async (data: FavouriteData): Promise<ServiceResponse> => {
  const { userId, productId } = data;
  if (!userId || !productId) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  // ENHANCEMENT 1: Use `findOrCreate` for an atomic "check-then-act" operation.
  // This is a single, safe database query that prevents race conditions.
  const [favourite, created] = await db.Favourite.findOrCreate({
    where: { userId, productId },
    defaults: { userId, productId },
  });

  if (created) {
    return { errCode: 0, message: "Product added to favourites successfully." };
  } else {
    // If it was not created, it means it already existed.
    return { errCode: 2, message: "This product is already in your favourites." };
  }
};

/**
 * @desc    Removes a product from a user's favourites list.
 * @param   {number} userId
 * @param   {number} productId
 * @returns {Promise<ServiceResponse>}
 */
const deleteFavouriteService = async (userId: number, productId: number): Promise<ServiceResponse> => {
  if (!userId || !productId) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  // ENHANCEMENT 2: Use a single, efficient `destroy` call.
  // It returns the number of rows deleted.
  const deletedRowCount = await db.Favourite.destroy({
    where: { userId, productId },
  });

  if (deletedRowCount > 0) {
    return { errCode: 0, message: "Product removed from favourites successfully." };
  } else {
    return { errCode: 2, message: "Favourite entry not found." };
  }
};

/**
 * @desc    Gets a list of all product IDs favourited by a user.
 * @param   {number} userId
 * @returns {Promise<ServiceResponse>}
 */
const getAllFavouriteService = async (userId: number): Promise<ServiceResponse> => {
  if (!userId) {
    return { errCode: 1, message: "Missing required user ID!" };
  }

  // ENHANCEMENT 3: Use `findAll` with `pluck` for maximum efficiency.
  // `pluck` tells Sequelize to only retrieve the values from a single column
  // and return them as a simple array.
  const favouriteProductIds = await db.Favourite.findAll({
    where: { userId },
    attributes: ['productId'],
    pluck: 'productId',
  });

  return { errCode: 0, data: favouriteProductIds, message: "get all favourite product success" };
};

const getAllProductFavouriteService = async (userId?: number, limit?: number, page?: number): Promise<ServiceResponse> => {
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

   const products = rows.map((favourite: FavouriteWithProduct) => {
    const plainProduct = favourite.ProductFavouriteData.get({ plain: true }) as ProductWithRatingAttributes;
    const avg = parseFloat(plainProduct.averageRating || '0');
    (plainProduct as any).rating = Math.round(avg * 10) / 10;
    delete (plainProduct as any).averageRating;
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
  createNewFavouriteService,
  deleteFavouriteService,
  getAllFavouriteService,
  getAllProductFavouriteService
};
