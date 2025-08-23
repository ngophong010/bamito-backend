import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import * as brandService from "../services/brandService.js";

const handleCreateNewBrand = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
  }
  
  const message = await brandService.createNewBrandService(req.body);

  res.status(message.errCode === 0 ? 201 : 400).json(message);
});

const handleGetAllBrand = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
  }
  
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const sort = req.query.sort as string;
  const name = req.query.name as string;
  const pagination = req.query.pagination === "true";

  const message = await brandService.getAllBrandService(
    limit,
    page,
    sort,
    name,
    pagination
  );

  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

const handleUpdateBrand = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
  }
  
  const message = await brandService.updateBrandService(req.body);
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

const handleDeleteBrand = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
  }
  
  const id = req.query.id as string;
  const message = await brandService.deleteBrandService(id);
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

export {
  handleCreateNewBrand,
  handleDeleteBrand,
  handleUpdateBrand,
  handleGetAllBrand,
};