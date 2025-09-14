import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

// Use named imports for the refactored service functions
import {
  createAddress,
  deleteAddress,
  updateAddress,
  getAddressesForUser,
  setAddressAsDefault,
} from "./deliveryAddress.service.js";

// A custom interface to add the 'user' property to the Request object
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    // ... other user properties from your token payload
  };
}

/**
 * @desc    Create a new delivery address for the logged-in user
 * @route   POST /api/profile/addresses
 * @access  Private
 */
const handleCreateAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // Get the userId from the authenticated token for security
  const userId = req.user!.id;
  const newAddress = await createAddress(userId, req.body);
  res.status(201).json(newAddress);
});

/**
 * @desc    Get all delivery addresses for the logged-in user
 * @route   GET /api/profile/addresses
 * @access  Private
 */
const handleGetAddressesForUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const addresses = await getAddressesForUser(userId);
  res.status(200).json(addresses);
});

/**
 * @desc    Update a specific delivery address
 * @route   PUT /api/addresses/:id
 * @access  Private (Owner)
 */
const handleUpdateAddress = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  const addressId = Number(req.params.id);
  const updatedAddress = await updateAddress(addressId, req.body);
  res.status(200).json(updatedAddress);
});

/**
 * @desc    Delete a specific delivery address
 * @route   DELETE /api/addresses/:id
 * @access  Private (Owner)
 */
const handleDeleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const addressId = Number(req.params.id);
  // Note: An `isAddressOwner` middleware should be used here to verify ownership.
  await deleteAddress(addressId);
  res.status(204).send(); // Standard for successful DELETE
});

/**
 * @desc    Set a specific address as the default for the logged-in user
 * @route   PATCH /api/addresses/:id/set-default
 * @access  Private (Owner)
 */
const handleSetAddressAsDefault = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const addressId = Number(req.params.id);

  const newDefaultAddress = await setAddressAsDefault(userId, addressId);
  res.status(200).json(newDefaultAddress);
});

export {
    handleCreateAddress,
    handleGetAddressesForUser,
    handleUpdateAddress,
    handleDeleteAddress,
    handleSetAddressAsDefault
}