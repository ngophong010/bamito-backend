import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";

import * as sizeService from "../services/sizeService.js";

// --- CREATE ---
const handleCreateNewSize = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const message = await sizeService.createNewSizeService(req.body);
  res.status(message.errCode === 0 ? 201 : 400).json(message);
});

// --- DELETE ---
const handleDeleteSize = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const id = Number(req.query.id);
  const message = await sizeService.deleteSizeService(id);
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

// --- UPDATE ---
const handleUpdateSize = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  const message = await sizeService.updateSizeService(req.body);
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

// --- READ (GET ALL - PAGINATED) ---
const handleGetAllSize = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const sort = req.query.sort as string;
  const name = req.query.name as string;

  const message = await sizeService.getAllSizeService(limit, page, sort, name);
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

// --- READ (GET ALL BY PRODUCT TYPE) ---
const handleGetAllSizeProductType = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const productTypeId = Number(req.query.productTypeId);
  const message = await sizeService.getAllSizeProductType(productTypeId);
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

export {
  handleCreateNewSize,
  handleDeleteSize,
  handleUpdateSize,
  handleGetAllSize,
  handleGetAllSizeProductType,
};
