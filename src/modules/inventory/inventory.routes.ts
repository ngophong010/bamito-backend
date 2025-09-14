import { Router } from 'express';
import { body, param } from 'express-validator';

// Import the refactored controller functions
import {
  handleUpdateInventoryEntry,
  handleDeleteInventoryEntry,
} from '../inventory/inventory.controller.js';
import { protect, isAdmin } from '../../middleware/auth.js';

const router = Router();

// --- Middleware ---
// All actions on a specific inventory entry are admin-only
router.use(protect, isAdmin);

// --- Validation ---
const idParamValidation = [
  param('id', 'A numeric ID is required in the URL path').isNumeric(),
];

const updateValidation = [
  // When updating, an admin is likely just changing the quantity.
  body('quantity', 'Quantity must be a non-negative integer').optional().isInt({ min: 0 }),
  // You can allow changing the product/size, but it's often better to delete and recreate.
];

// --- Route Definitions ---

router.route('/:id')
  /**
   * @route   PUT /api/inventory/:id
   * @desc    Update an inventory entry by its unique ID
   * @access  Private (Admin)
   */
  .put(idParamValidation, updateValidation, handleUpdateInventoryEntry)
  /**
   * @route   DELETE /api/inventory/:id
   * @desc    Delete an inventory entry by its unique ID
   * @access  Private (Admin)
   */
  .delete(idParamValidation, handleDeleteInventoryEntry);

export default router;