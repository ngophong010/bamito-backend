import type { Request, Response } from "express";
import { validationResult } from 'express-validator';
import asyncHandler from "express-async-handler";
import { v2 as cloudinary } from 'cloudinary';

// Import the refactored, named service functions
import {
  createUserByAdmin,
  deleteUser,
  updateUser,
  getUserInfo,
  getAllUsers,
  changePasswordInProfile,
  getAllRoles,
  sendSmsOtp,
  // Note: login, register, etc., might be in a separate `auth.controller.ts`
} from "./user.service.js";
// A simple existence check is better in the service itself
import { checkEmailExists } from './user.service.js';

// ===============================================================
// --- USER PROFILE & INFO ---
// ===============================================================

const handleGetUserInfo = asyncHandler(async (req: Request, res: Response) => {
  // In a real app, you'd get the user ID from the authenticated token, not a query param
  // const userId = (req as any).user.id; 
  const userId = Number(req.query.userId); // Keeping original logic for now

  const userInfo = await getUserInfo(userId);
  res.status(200).json(userInfo);
});

const handleChangeProfilePassword = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  };

  const { id, currentPassword, newPassword } = req.body;
  await changePasswordInProfile(id, currentPassword, newPassword);
  res.status(200).json({ message: "Password changed successfully." });
});

// ===============================================================
// --- ADMIN USER MANAGEMENT (CRUD) ---
// ===============================================================

const handleCreateUserByAdmin = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const newUser = await createUserByAdmin(req.body);
  res.status(201).json(newUser);
});

const handleGetAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { limit, page, sort, name } = req.query;
  const usersData = await getAllUsers(
    Number(limit) || undefined,
    Number(page) || undefined,
    sort as string,
    name as string
  );
  res.status(200).json(usersData);
});

const handleUpdateUser = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const id = Number(req.params.id);
    const updatedUser = await updateUser(id, req.body, req.file);
    res.status(200).json(updatedUser);
  } catch (error) {
    // If the service throws ANY error (not found, duplicate email, etc.),
    // clean up the newly uploaded file before letting the errorHandler take over.
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    throw error; // Re-throw the error
  }
});

const handleDeleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteUser(id);
  res.status(204).send(); // Standard for successful DELETE
});

// ===============================================================
// --- UTILITY & MISC ---
// ===============================================================

const handleCheckEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.query;
  if (typeof email !== 'string') {
    res.status(400).json({ message: "Invalid or missing email parameter." });
    return;
  }
  const exists = await checkEmailExists(email);
  // Return a simple, clear boolean response
  res.status(200).json({ exists });
});

const handleSendSmsOtp = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.query.userId); // Or better, from req.user.id
  const result = await sendSmsOtp(userId);
  res.status(200).json(result);
});

const handleGetAllRoles = asyncHandler(async (req: Request, res: Response) => {
  const roles = await getAllRoles();
  res.status(200).json(roles);
});

export {
  handleGetUserInfo,
  handleChangeProfilePassword,
  handleCreateUserByAdmin,
  handleGetAllUsers,
  handleUpdateUser,
  handleDeleteUser,
  handleGetAllRoles,
  handleSendSmsOtp,
  handleCheckEmail
};