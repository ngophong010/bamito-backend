import { Router } from 'express';
import { body } from 'express-validator';

// Import the refactored, named controller functions
import {
  handleAddOrUpdateItem,
  handleRemoveItem,
  handleGetCartContents,
} from './cart.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();

// ===============================================================
// --- MIDDLEWARE ---
// ===============================================================

// All cart actions require a user to be logged in, so we apply the `protect`
// middleware to the entire router for security and simplicity.
router.use(protect);

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================

const itemIdentifiersValidation = [
  body('productId', 'A numeric productId is required').isNumeric(),
  body('sizeId', 'A numeric sizeId is required').isNumeric(),
];

const addOrUpdateValidation = [
  ...itemIdentifiersValidation, // Reuse the identifiers
  body('quantity', 'Quantity must be a non-negative integer').isInt({ min: 0 }),
];

// ===============================================================
// --- ROUTE DEFINITIONS ---
// ===============================================================

/**
 * @route   GET /api/profile/cart
 * @desc    Get the full contents of the logged-in user's cart.
 * @access  Private
 */
router.get('/', handleGetCartContents);

// This route group handles actions on the collection of items within the cart.
router.route('/items')
  /**
   * @route   POST /api/profile/cart/items
   * @desc    Add or update an item in the cart. The service handles the "upsert" logic.
   * @access  Private
   */
  .post(
    addOrUpdateValidation,
    handleAddOrUpdateItem
  )
  /**
   * @route   DELETE /api/profile/cart/items
   * @desc    Remove a specific item (product/size combo) from the cart.
   *          Identifiers are passed in the body for simplicity.
   * @access  Private
   */
  .delete(
    itemIdentifiersValidation,
    handleRemoveItem
  );

export default router;