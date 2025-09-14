import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';

import {
  createVoucher,
  deleteVoucher,
  updateVoucher,
  getAllVouchers,
  getActiveVouchersForUser,
} from "./voucher.service.js";

const handleCreateVoucher = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If validation fails, a file may have been uploaded. Clean it up.
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const data = {
      ...req.body,
      image: req.file?.path,
      imageId: req.file?.filename,
    };

    // The service now returns the created voucher object directly.
    const newVoucher = await createVoucher(data);
    res.status(201).json(newVoucher);

  } catch (error) {
    // If ANY error is thrown from the service (e.g., duplicate ID),
    // clean up the uploaded file.
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    // Re-throw the error to be caught by the global error handler middleware.
    throw error;
  }
});

const handleGetAllVouchers = asyncHandler(async (req: Request, res: Response) => {
  const { limit, page, sort, name, pagination } = req.query;

  const voucherData = await getAllVouchers(
    Number(limit) || undefined,
    Number(page) || undefined,
    sort as string,
    name as string,
    pagination !== 'false' // Default to true
  );

  res.status(200).json(voucherData);
});

const handleGetActiveVouchersForUser = asyncHandler(async (req: Request, res: Response) => {
  const activeVouchers = await getActiveVouchersForUser();
  res.status(200).json(activeVouchers);
});

const handleUpdateVoucher = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const id = Number(req.params.id);
    const data = {
      ...req.body,
      image: req.file?.path,
      imageId: req.file?.filename,
    };

    const updatedVoucher = await updateVoucher(id, data);
    res.status(200).json(updatedVoucher);

  } catch (error) {
    // If the service throws (e.g., voucher not found, duplicate ID),
    // clean up the newly uploaded file.
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    throw error;
  }
});

const handleDeleteVoucher = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const id = Number(req.params.id);
  // The service now handles both Cloudinary deletion and DB deletion.
  await deleteVoucher(id);
  res.status(204).send(); // Standard for successful DELETE
});

export {
  handleCreateVoucher,
  handleGetAllVouchers,
  handleGetActiveVouchersForUser,
  handleUpdateVoucher,
  handleDeleteVoucher,
};