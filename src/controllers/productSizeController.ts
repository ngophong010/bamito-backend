import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

import * as productSizeService from "../services/productSizeService.js";

/**
 * @desc    Create a new product size (inventory) entry
 * @route   POST /api/product-sizes
 * @access  Private (Admin)
 */
const handleCreateNewProductSize = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const message = await productSizeService.createNewProductSizeService(req.body);
  res.status(message.errCode === 0 ? 201 : 400).json(message);
});

/**
 * @desc    Delete a product size entry
 * @route   DELETE /api/product-sizes/:id
 * @access  Private (Admin)
 */
const handleDeleteProductSize = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = Number(req.params.id);
  const message = await productSizeService.deleteProductSizeService(id);
  res.status(message.errCode === 0 ? 200 : 404).json(message); // Use 404 if not found
});

/**
 * @desc    Update a product size entry
 * @route   PUT /api/product-sizes/:id
 * @access  Private (Admin)
 */
const handleUpdateProductSize = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = Number(req.params.id);
  const message = await productSizeService.updateProductSizeService({ id, ...req.body });
  res.status(message.errCode === 0 ? 200 : 404).json(message); // Use 404 if not found
});

/**
 * @desc    Get all sizes for a specific product
 * @route   GET /api/product-sizes
 * @access  Public
 */
const handleGetAllProductSize = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  // Safely parse query parameters with defaults
  const productId = Number(req.query.productId);
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const sort = req.query.sort as string;

  const message = await productSizeService.getAllProductSizeService(productId, limit, page, sort);
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

export {
  handleCreateNewProductSize,
  handleDeleteProductSize,
  handleUpdateProductSize,
  handleGetAllProductSize,
};
