import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';

import * as voucherService from "../services/voucherService.js";

/**
 * @desc    Create a new voucher with an image
 * @route   POST /api/vouchers
 * @access  Private (Admin)
 */
const handleCreateNewVoucher = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If validation fails, the file was still uploaded, so we must clean it up.
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // ENHANCEMENT 1: Robust file cleanup pattern
  try {
    const data = {
      ...req.body,
      imageUrl: req.file?.path,
      imageId: req.file?.filename,
    };
    
    const message = await voucherService.createNewVoucherService(data);

    // If the service returns a predictable error (e.g., duplicate ID), clean up the file.
    if (message.errCode !== 0) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      res.status(400).json(message);
      return;
    }

    res.status(201).json(message);
  } catch (error) {
    // If an unexpected error occurs, clean up the file before letting asyncHandler handle the error.
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    throw error; // Re-throw the error to be caught by asyncHandler
  }
});

/**
 * @desc    Delete a voucher
 * @route   DELETE /api/vouchers/:id
 * @access  Private (Admin)
 */
const handleDeleteVoucher = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = Number(req.params.id);
  const message = await voucherService.deleteVoucherService(id);
  res.status(message.errCode === 0 ? 200 : 404).json(message);
});

/**
 * @desc    Update a voucher
 * @route   PUT /api/vouchers/:id
 * @access  Private (Admin)
 */
const handleUpdateVoucher = asyncHandler(async (req: Request, res: Response) => {
  // Similar logic to create: handle validation and file cleanup
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const id = Number(req.params.id);
    const data = {
      id,
      ...req.body,
      imageUrl: req.file?.path,
      imageId: req.file?.filename,
    };
    const message = await voucherService.updateVoucherService(data);

    if (message.errCode !== 0) {
      if (req.file) await cloudinary.uploader.destroy(req.file.filename);
      res.status(404).json(message); // 404 for "not found"
      return;
    }

    res.status(200).json(message);
  } catch (error) {
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    throw error;
  }
});

/**
 * @desc    Get all vouchers (paginated for admin)
 * @route   GET /api/vouchers/all
 * @access  Private (Admin)
 */
const handleGetAllVoucher = asyncHandler(async (req: Request, res: Response) => {
  const { limit, page, sort, name, pagination } = req.query;
  const message = await voucherService.getAllVoucherService(
    Number(limit) || undefined,
    Number(page) || undefined,
    sort as string,
    name as string,
    pagination === 'true'
  );
  res.status(200).json(message);
});

/**
 * @desc    Get all active vouchers for users
 * @route   GET /api/vouchers
 * @access  Public
 */
const handleGetAllVoucherUser = asyncHandler(async (req: Request, res: Response) => {
  const message = await voucherService.getAllVoucherUserService();
  res.status(200).json(message);
});

export {
  handleCreateNewVoucher,
  handleDeleteVoucher,
  handleUpdateVoucher,
  handleGetAllVoucher,
  handleGetAllVoucherUser,
};
