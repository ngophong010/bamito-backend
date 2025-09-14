import { Router } from 'express';
import { body, param, query } from 'express-validator';

// Import the refactored, named controller functions
import {
  handleAddFavourite,
  handleRemoveFavourite,
  handleGetFavouritedProductIds,
  handleGetFavouritedProducts,
} from './favourite.controller.js';
import { protect } from '../../middleware/auth.js'; // `isAdmin` is not needed for these user-centric routes

const router = Router();

// ===============================================================
// --- MIDDLEWARE ---
// ===============================================================

// All routes in this file are for the currently logged-in user,
// so we apply the `protect` middleware to the entire router.
router.use(protect);

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================

const productIdBodyValidation = [
  body('productId', 'A numeric productId is required in the body').isNumeric(),
];

const productIdParamValidation = [
  param('productId', 'A numeric productId is required in the URL path').isNumeric(),
];

const paginationValidation = [
    query('limit').optional().isNumeric().toInt(),
    query('page').optional().isNumeric().toInt(),
];

// ===============================================================
// --- ROUTE DEFINITIONS ---
// ===============================================================

/**
 * @route   GET /api/profile/favourites/ids
 * @desc    Get an array of favourited product IDs for the logged-in user
 * @access  Private
 */
router.get(
    '/ids',
    handleGetFavouritedProductIds
);

router.route('/')
  /**
   * @route   GET /api/profile/favourites
   * @desc    Get a paginated list of full favourite products for the logged-in user
   * @access  Private
   */
  .get(
      paginationValidation,
      handleGetFavouritedProducts
  )
  /**
   * @route   POST /api/profile/favourites
   * @desc    Add a new product to the logged-in user's favourites
   * @access  Private
   */
  .post(
      productIdBodyValidation,
      handleAddFavourite
  );

router.route('/:productId')
  /**
   * @route   DELETE /api/profile/favourites/:productId
   * @desc    Remove a product from the logged-in user's favourites
   * @access  Private
   */
  .delete(
      productIdParamValidation,
      handleRemoveFavourite
  );

export default router;