import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

import * as productTypeService from "../services/productTypeService.js";

/**
 * @desc    Create a new product type
 * @route   POST /api/product-types
 * @access  Private (Admin)
 */
const handleCreateNewProductType = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const message = await productTypeService.createNewProductTypeService(req.body);
  res.status(message.errCode === 0 ? 201 : 400).json(message);
});

/**
 * @desc    Get a single product type by its business ID
 * @route   GET /api/product-types/:productTypeId
 * @access  Public
 */
const handleGetProductType = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
   const { productTypeId } = req.params as { productTypeId: string };
  const message = await productTypeService.getProductTypeService(productTypeId);
  res.status(message.errCode === 0 ? 200 : 404).json(message);
});

/**
 * @desc    Update a product type
 * @route   PUT /api/product-types/:id
 * @access  Private (Admin)
 */
const handleUpdateProductType = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = Number(req.params.id);
  const message = await productTypeService.updateProductTypeService({ id, ...req.body });
  res.status(message.errCode === 0 ? 200 : 404).json(message); // Use 404 if not found
});

/**
 * @desc    Delete a product type
 * @route   DELETE /api/product-types/:id
 * @access  Private (Admin)
 */
const handleDeleteProductType = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = Number(req.params.id);
  const message = await productTypeService.deleteProductTypeService(id);
  res.status(message.errCode === 0 ? 200 : 404).json(message); // Use 404 if not found
});

/**
 * @desc    Get all product types (paginated for admin or full list for users)
 * @route   GET /api/product-types
 * @access  Public
 */
const handleGetAllProductType = asyncHandler(async (req: Request, res: Response) => {
  // Safely parse query parameters with defaults
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const sort = req.query.sort as string;
  const name = req.query.name as string;
  const pagination = req.query.pagination !== 'false'; // Default to true unless explicitly false

  const message = await productTypeService.getAllProductTypeService(limit, page, sort, name, pagination);
  res.status(200).json(message);
});

export {
  handleCreateNewProductType,
  handleGetProductType,
  handleUpdateProductType,
  handleDeleteProductType,
  handleGetAllProductType,
};
