import { Router } from 'express';
import { body, param } from 'express-validator';

import {
  handleCreateAddress,
  handleDeleteAddress,
  handleUpdateAddress,
  handleGetAddressesForUser,
  handleSetAddressAsDefault,
} from './deliveryAddress.controller.js';
import { protect, isAddressOwner } from '../../middleware/auth.js'; // `isAddressOwner` is a new required middleware

const profileRouter = Router();
const addressRouter = Router();

// ===============================================================
// --- VALIDATION CHAINS ---
// ===============================================================
const addressValidation = [
  body('receiverName', 'Receiver name is required').isString().notEmpty(),
  body('phone', 'Phone number is required').isString().notEmpty(),
  body('streetLine1', 'Street address is required').isString().notEmpty(),
  body('city', 'City is required').isString().notEmpty(),
  body('postalCode', 'Postal code is required').isString().notEmpty(),
  body('country', 'Country is required').isString().notEmpty(),
];

const idParamValidation = [
  param('id', 'A numeric address ID is required').isNumeric(),
];

// ===============================================================
// --- ROUTES FOR THE USER'S COLLECTION OF ADDRESSES ---
// ===============================================================
// These routes are mounted under `/profile/addresses` and are for the logged-in user.
profileRouter.use(protect); // All profile routes require a user to be logged in

profileRouter.route('/')
  /**
   * @route   GET /api/profile/addresses
   * @desc    Get all of the logged-in user's addresses
   */
  .get(handleGetAddressesForUser)
  /**
   * @route   POST /api/profile/addresses
   * @desc    Add a new address to the logged-in user's address book
   */
  .post(addressValidation, handleCreateAddress);


// ===============================================================
// --- ROUTES FOR A SPECIFIC ADDRESS ENTRY ---
// ===============================================================
// These routes are mounted under `/addresses` and act on a specific address ID.
addressRouter.use(protect); // All direct address actions require login

addressRouter.route('/:id')
  /**
   * @route   PUT /api/addresses/:id
   * @desc    Update a specific address
   * @access  Private (Owner)
   */
  .put(isAddressOwner, idParamValidation, addressValidation, handleUpdateAddress)
  /**
   * @route   DELETE /api/addresses/:id
   * @desc    Delete a specific address
   * @access  Private (Owner)
   */
  .delete(isAddressOwner, idParamValidation, handleDeleteAddress);

addressRouter.patch(
  '/:id/set-default',
  isAddressOwner,
  idParamValidation,
  handleSetAddressAsDefault
);

// We export both routers to be mounted separately in the main index.
export { profileRouter, addressRouter };