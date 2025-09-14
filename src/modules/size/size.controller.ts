import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";

// Use named imports for the refactored service functions
import {
  createSize,
  deleteSize,
  updateSize,
  getAllSizes,
  getAllSizesByProductType,
} from "./size.service.js";

const handleCreateSize = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const newSize = await createSize(req.body);
  res.status(201).json(newSize);
});

const handleGetAllSizes = asyncHandler(async (req: Request, res: Response) => {
  const { limit, page, sort, name } = req.query;

  const sizeData = await getAllSizes(
    Number(limit) || undefined,
    Number(page) || undefined,
    sort as string,
    name as string
  );
  res.status(200).json(sizeData);
});

const handleUpdateSize = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  const id = Number(req.params.id);
  const updatedSize = await updateSize(id, req.body);
  res.status(200).json(updatedSize);
});

const handleDeleteSize = asyncHandler(async (req: Request, res: Response) => {
  // ID should come from URL parameters for RESTful design
  const id = Number(req.params.id);
  await deleteSize(id);
  res.status(204).send(); // 204 No Content is standard for successful DELETE
});

export const handleGetAllSizesByCategory = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // This ID is better as a URL parameter, e.g., /api/product-types/:id/sizes
  // But we'll keep it as a query param for now to match your original logic.
  const productTypeId = Number(req.query.productTypeId);
  const sizes = await getAllSizesByProductType(productTypeId);
  res.status(200).json(sizes);
});

export {
  handleCreateSize,
  handleGetAllSizes,
  handleUpdateSize,
  handleDeleteSize,
};