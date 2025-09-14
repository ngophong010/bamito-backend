import { Router } from 'express';
import { body, param } from 'express-validator';

// Import the refactored controller functions
import {
  handleUpdateFeedback,
  handleDeleteFeedback,
  handleGetAllFeedbackForProduct
} from './feedback.controller.js';
// Import your specific authorization middleware
import { protect, isAdmin, isFeedbackOwnerOrAdmin } from '../../middleware/auth.js';

const router = Router();

// ===============================================================
// --- MIDDLEWARE ---
// ===============================================================

// All routes in this file require a user to be logged in.
router.use(protect);

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================

const idParamValidation = [
  param('id', 'A numeric feedback ID is required in the URL path').isNumeric(),
];

const updateValidation = [
  body('rating', 'Rating must be a number between 1 and 5').optional().isInt({ min: 1, max: 5 }),
  body('description', 'Description must be a string').optional().isString(),
];

// ===============================================================
// --- ROUTE DEFINITIONS ---
// ===============================================================

router.route('/:id')
  /**
   * @route   PUT /api/feedback/:id
   * @desc    Update a feedback entry
   * @access  Private (Owner or Admin)
   */
  .put(
    idParamValidation,
    updateValidation,
    isFeedbackOwnerOrAdmin, // Middleware to check ownership or admin status
    handleUpdateFeedback
  )
  /**
   * @route   DELETE /api/feedback/:id
   * @desc    Delete a feedback entry
   * @access  Private (Admin)
   */
  .delete(
    idParamValidation,
    isAdmin, // Only admins can delete feedback
    handleDeleteFeedback
  );

router.get('/products/:productId/feedback', handleGetAllFeedbackForProduct);

export default router;