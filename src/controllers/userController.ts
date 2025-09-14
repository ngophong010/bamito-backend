import type { Request, Response } from "express";
import { validationResult } from 'express-validator';
import asyncHandler from "express-async-handler";
import { v2 as cloudinary } from 'cloudinary'; // Modern import for cloudinary

import * as userService from "../services/userService.js";

// --- USER INFORMATION ---

const handleGetUserInfor = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  const userId = Number(req.query.userId);
  const message = await userService.getUserInforService(userId);
  res.status(message.errCode === 0 ? 200 : 404).json(message); // Use 404 for "not found"
});

// --- OTP & PASSWORD MANAGEMENT (ADMIN & USER) ---

const handleCreateNewUser = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const message = await userService.createNewUserService(req.body);
  res.status(message.errCode === 0 ? 201 : 400).json(message);
});


const handleCheckEmail = asyncHandler( async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { email } = req.query;
    if (typeof email !== 'string') {
      res.status(400).json({ message: "Invalid or missing email parameter." });
      return;
    }
    const message = await userService.checkEmailExists(email);
    if (message) {
      res.status(200).json({
        errCode: 0,
        message: "Email exists.",
      });
    } else {
      res.status(200).json({
        errCode: 1,
        message: "Email not found",
      });
    }
  } catch (error) {
    console.log("hi", error);
    res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
});

const handleSendSMSOtpCode = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  const userId = Number(req.query.userId);
  const message = await userService.handleSendSMSOtpCodeService(userId);
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

const handleChangeProfilePassword = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  };

  const message = await userService.changePasswordProfileService(req.body);
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

// --- USER CRUD (ADMIN) ---

const handleGetUser = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  };

  const id = Number(req.params.id);
  const message = await userService.getUserService(id);
  res.status(message.errCode === 0 ? 200 : 404).json(message);
});

const handleGetAllUser = asyncHandler(async (req: Request, res: Response) => {
  const { limit, page, sort, name } = req.query;
  const message = await userService.getAllUserService(
    Number(limit) || undefined,
    Number(page) || undefined,
    sort as string,
    name as string
  );
  res.status(200).json(message);
});

const handleUpdateUser = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If validation fails, the file was still uploaded, so we must clean it up.
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // ENHANCEMENT 1: Robust file cleanup pattern
  try {
    const id = Number(req.params.id);
    const data = {
      id,
      ...req.body,
      avatarUrl: req.file?.path,
      avatarId: req.file?.filename,
    };
    
    const message = await userService.updateUserService(data);

    if (message.errCode !== 0) {
      if (req.file) await cloudinary.uploader.destroy(req.file.filename);
      res.status(400).json(message); // 400 for predictable errors like duplicates
      return;
    }

    res.status(200).json(message);
  } catch (error) {
    // If an unexpected error occurs, clean up the file before letting asyncHandler handle it.
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    throw error; // Re-throw the error to be caught by asyncHandler
  }
});

const handleDeleteUser = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  };

  const id = Number(req.params.id);
  const message = await userService.deleteUserService(id);
  res.status(message.errCode === 0 ? 200 : 404).json(message); // Use 404 for not found
});

const handleGetAllRole = asyncHandler(async (req: Request, res: Response) => {
  const message = await userService.getAllRoleService();
  res.status(200).json(message);
});

export {
  handleCreateNewUser,
  handleDeleteUser,
  handleUpdateUser,
  handleGetUser,
  handleGetAllUser,
  handleChangeProfilePassword,
  handleGetAllRole,
  handleGetUserInfor,
  handleSendSMSOtpCode,
  handleCheckEmail,
};

