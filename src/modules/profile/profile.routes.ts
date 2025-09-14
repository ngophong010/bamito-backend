import { Router } from 'express';
import { body, query, param } from 'express-validator';
import {
  handleCreateOrder,
  handleGetUserOrders,
  handleCancelOrder,
} from '../order/order.controller.js';
import { protect, isOrderOwner } from '../../middleware/auth.js';

const router = Router();

router.use(protect); // All profile routes require login

// --- Validation ---
const createOrderValidation = [ 
  body('totalPrice').isNumeric(),
  body('payment').isString().notEmpty(),
  body('deliveryAddress').isString().notEmpty(),
  body('status').isNumeric(),
  body('cartItems').isArray({ min: 1 }),
  body('cartItems.*.productId').isNumeric(),
  body('cartItems.*.sizeId').isNumeric(),
  body('cartItems.*.quantity').isInt({ min: 1 }), 
];
const statusQueryValidation = [ query('status', 'A numeric status is required').isNumeric() ];

// --- Route Definitions ---
router.route('/orders')
    /**
     * @route   POST /api/profile/orders
     * @desc    Create a new order from the user's cart (for non-VNPAY checkouts)
     * @access  Private
     */
    .post(createOrderValidation, handleCreateOrder)
    /**
     * @route   GET /api/profile/orders
     * @desc    Get the logged-in user's order history
     * @access  Private
     */
    .get(statusQueryValidation, handleGetUserOrders);


/**
 * @route   PATCH /api/profile/orders/:id/cancel
 * @desc    Cancel one of the user's own orders
 * @access  Private (Owner)
 */
router.patch(
    '/orders/:id/cancel',
    param('id').isNumeric(),
    isOrderOwner, // Middleware to verify this order belongs to the logged-in user
    handleCancelOrder
);

export default router;
