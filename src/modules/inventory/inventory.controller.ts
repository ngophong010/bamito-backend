import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

import {
  createInventoryEntry,
  deleteInventoryEntry,
  updateInventoryEntry,
  getInventoryForProduct,
} from "./inventory.service.js";

/**
 * @desc    Create a new inventory entry for a specific product
 * @route   POST /api/products/:productId/inventory
 * @access  Private (Admin)
 */
const handleCreateInventoryEntry = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // Get productId from the URL, combine with body data for the service
  const productId = Number(req.params.productId);
  const data = { ...req.body, productId };
  
  const newEntry = await createInventoryEntry(data);
  res.status(201).json(newEntry);
});

/**
 * @desc    Get all inventory entries for a specific product
 * @route   GET /api/products/:productId/inventory
 * @access  Public
 */
const handleGetInventoryForProduct = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  const productId = Number(req.params.productId);
  const { limit, page, sort } = req.query;

  const inventoryData = await getInventoryForProduct(
    productId,
    Number(limit) || undefined,
    Number(page) || undefined,
    sort as string
  );
  res.status(200).json(inventoryData);
});

/**
 * @desc    Update a specific inventory entry by its own ID
 * @route   PUT /api/inventory/:id
 * @access  Private (Admin)
 */
const handleUpdateInventoryEntry = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  const id = Number(req.params.id);
  const updatedEntry = await updateInventoryEntry(id, req.body);
  res.status(200).json(updatedEntry);
});

/**
 * @desc    Delete a specific inventory entry by its own ID
 * @route   DELETE /api/inventory/:id
 * @access  Private (Admin)
 */
const handleDeleteInventoryEntry = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteInventoryEntry(id);
  res.status(204).send(); // Standard for successful DELETE
});

export {
  handleCreateInventoryEntry,
  handleGetInventoryForProduct,
  handleUpdateInventoryEntry,
  handleDeleteInventoryEntry,
};
