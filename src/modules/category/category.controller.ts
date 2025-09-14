import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

import {
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getAllCategories,
} from "./category.service.js";

const handleCreateCategory = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  // The service returns the new category object on success
  const newCategory = await createCategory(req.body);
  res.status(201).json(newCategory);
});

const handleGetAllCategories = asyncHandler(async (req: Request, res: Response) => {
  const { limit, page, sort, name } = req.query;
  const pagination = req.query.pagination !== 'false'; // Default to true

  const categoryData = await getAllCategories(
    Number(limit) || undefined,
    Number(page) || undefined,
    sort as string,
    name as string,
    pagination
  );

  res.status(200).json(categoryData);
});

const handleGetCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params; // Get the business ID from the URL parameter
  const category = await getCategoryById(categoryId);

  if (!category) {
    // If the service returns null, it means not found.
    res.status(404).json({ message: "Category not found." });
    return;
  }

  res.status(200).json(category);
});

const handleUpdateCategory = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  // Get the numeric primary key from the URL parameter
  const id = Number(req.params.id);
  const updatedCategory = await updateCategory(id, req.body);
  res.status(200).json(updatedCategory);
});

const handleDeleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  const id = Number(req.params.id);
  await deleteCategory(id);
  res.status(204).send(); // Standard for successful DELETE
});

export {
  handleCreateCategory,
  handleGetCategoryById,
  handleGetAllCategories,
  handleUpdateCategory,
  handleDeleteCategory,
};
