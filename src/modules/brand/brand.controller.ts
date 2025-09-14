import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";

import { 
  createBrand, 
  getAllBrands,
  updateBrand, 
  deleteBrand,  
} from "./brand.service.js";

/**
 * @desc    Create a new brand
 * @route   POST /api/v1/brands
 * @access  Private (Admin)
 */
export const handleCreateBrand = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // This is a "fail" response according to JSend
    res.status(400).json({ status: "fail", data: errors.mapped() });
    return;
  }
  
  // The service now returns the created object directly on success
  const newBrand = await createBrand(req.body);

  // The controller's job is just to send the success response
  res.status(201).json(newBrand);
});

/**
 * @desc    Get all brands (paginated or full list)
 * @route   GET /api/v1/brands
 * @access  Public
 */
export const handleGetAllBrands = asyncHandler(async (req: Request, res: Response) => {
  const { limit, page, sort, name } = req.query;
  const pagination = req.query.pagination !== 'false'; // Default to true

  // The service now returns the data object directly
  const brandData = await getAllBrands(
    Number(limit) || undefined,
    Number(page) || undefined,
    sort as string,
    name as string,
    pagination
  );

  res.status(200).json({ status: "success", data: brandData });
});

/**
 * @desc    Update a brand
 * @route   PUT /api/v1/brands/:id
 * @access  Private (Admin)
 */
export const handleUpdateBrand = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // This is a "fail" response according to JSend
    res.status(400).json({ status: "fail", data: errors.mapped() });
    return;
  }
  
  // Best practice: Get the ID from the URL parameters, not the body.
  const id = Number(req.params.id);
  const updatedBrand = await updateBrand(id, req.body);

   res.status(200).json({ status: "success", data: updatedBrand });
});

/**
 * @desc    Delete a brand
 * @route   DELETE /api/v1/brands/:id
 * @access  Private (Admin)
 */
const handleDeleteBrand = asyncHandler(async (req: Request, res: Response) => {
  // Best practice: Get the ID from the URL parameters.
  const id = Number(req.params.id);
  await deleteBrand(id);
  
  // Best practice for DELETE is to return a 204 No Content response.
  res.status(204).send();
});
