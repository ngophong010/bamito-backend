import db from "../models/index.js";
import type { ServiceResponse } from "../types/serviceResponse.js";

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

export {
  createNewFavouriteService,
  deleteFavouriteService,
  getAllFavouriteService,
};
