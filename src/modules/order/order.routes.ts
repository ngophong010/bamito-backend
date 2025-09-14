import { Router } from 'express';
import { body, query, param } from 'express-validator';

import {
  handleGetAllOrdersForAdmin,
  handleGetOrderDetail,
  handleUpdateOrderStatus,
  handleDeleteOrder,
  handleGetStatistics,
  handleGetSalesReport,
} from './order.controller.js';
import { protect, isAdmin } from '../../middleware/auth.js';

const router = Router();

// --- Middleware ---
// All routes in this file are for admins only.
router.use(protect, isAdmin);

// --- Validation ---
const idParamValidation = [ param('id', 'A numeric order ID is required').isNumeric() ];
const statusQueryValidation = [ query('status', 'A numeric status is required').isNumeric() ];
const updateStatusValidation = [ body('status', 'A numeric status is required').isNumeric() ];
const reportValidation = [
    query('timeStart', 'A valid ISO8601 start time is required').isISO8601().toDate(),
    query('timeEnd', 'A valid ISO8601 end time is required').isISO8601().toDate(),
];

// --- Route Definitions ---

router.get('/statistics', handleGetStatistics);
router.get('/reports/sales', reportValidation, handleGetSalesReport);

router.route('/')
    /**
     * @route   GET /api/orders
     * @desc    [ADMIN] Get all orders, filterable by status
     * @access  Private (Admin)
     */
    .get(statusQueryValidation, handleGetAllOrdersForAdmin);

router.route('/:id')
    /**
     * @route   GET /api/orders/:id
     * @desc    [ADMIN] Get full details for a specific order
     * @access  Private (Admin)
     */
    .get(idParamValidation, handleGetOrderDetail)
    /**
     * @route   DELETE /api/orders/:id
     * @desc    [ADMIN] Soft-delete an order
     * @access  Private (Admin)
     */
    .delete(idParamValidation, handleDeleteOrder);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    [ADMIN] Update the status of an order
 * @access  Private (Admin)
 */
router.patch(
    '/:id/status', // Use PATCH for partial updates like status change
    idParamValidation,
    updateStatusValidation,
    handleUpdateOrderStatus
);

export default router;
