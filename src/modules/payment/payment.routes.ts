import { Router } from 'express';
import { body } from 'express-validator';
import { handleCreatePaymentUrl, handleVnPayReturn } from './payment.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();

// --- Validation for creating a payment URL ---
const createPaymentValidation = [
  body('totalPrice').isNumeric(),
  body('payment').isString().notEmpty(),
  body('deliveryAddress').isString().notEmpty(),
  body('cartItems').isArray({ min: 1 }),
  // ... add more detailed validation for cartItems if needed
];

/**
 * @route   POST /api/payment/create-url
 * @desc    Create a VNPAY payment URL for the current user's checkout
 * @access  Private
 */
router.post(
    '/create-url',
    protect, // User must be logged in to create a payment
    createPaymentValidation,
    handleCreatePaymentUrl
);

/**
 * @route   GET /api/payment/vnpay-return
 * @desc    Callback URL for VNPAY to return to after payment attempt
 * @access  Public
 */
router.get('/vnpay-return', handleVnPayReturn);

export default router;