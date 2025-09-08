import db, { sequelize } from "../models/index.js";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import twilio from "twilio";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { cloudinaryConfig } from '../config/env.js';

import type { ServiceResponse } from "../types/serviceResponse.js";
import * as emailService from "./emailService.js";
import { generalAccessToken, generalRefreshToken } from "./jwtService.js";
// Initialize Twilio client correctly
dotenv.config();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

cloudinary.config(cloudinaryConfig);

// OR, if you prefer not to import the config object:
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!, // The '!' tells TypeScript "Trust me, I know this is not undefined"
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// --- TYPES ---
interface UserCreationData {
  email: string;
  userName: string;
  password?: string;
  roleId: number;
  phoneNumber?: string;
  avatar?: string;
  birthday?: Date;
  address?: string;
}

interface UserUpdateData {
  id: number;
  email: string;
  userName: string;
  roleId: number;
  phoneNumber?: string;
  birthday?: Date;
  password?: string;
  avatarUrl?: string;
  avatarId?: string;
  address?: string;
}

interface PasswordChangeData {
  id: number;
  currentPassword?: string;
  newPassword?: string;
}

// --- AUTHENTICATION ---

/**
 * Checks if a user with the given email already exists.
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>} - True if the user exists, false otherwise.
 */
const checkEmailExists = async (email: string): Promise<boolean> => {
  if (!email) {
    return false;
  }
  const user = await db.User.findOne({ where: { email } });
  // The `!!` operator is a concise way to convert a truthy (object) or falsy (null) value
  // into a true boolean.
  return !!user;
};

const loginService = async (email: string, password: string): Promise<ServiceResponse> => {
  if (!email || !password) {
    return { errCode: 1, message: "Missing email or password." };
  }
  // ENHANCEMENT 2: Use a single, efficient query.
  // Use the 'withPassword' scope we defined in the model to fetch the password hash.
  const user = await db.User.scope('withPassword').findOne({
    where: { email, status: 1 },
    include: [{ model: db.Role, as: "roleData", attributes: ["roleId", "roleName"] }],
  });
  if (!user) {
    return { errCode: 2, message: "User not found or account not activated." };
  }
  // The model now has a method to check the password
  const isPasswordCorrect = user.validPassword(password);
  if (!isPasswordCorrect) {
    return { errCode: 4, message: "Incorrect password." };
  }
  const userPayload = { id: user.id, role: user.roleData.roleId };
  const access_token = await generalAccessToken(userPayload);
  const refresh_token = await generalRefreshToken(userPayload);
  return { errCode: 0, message: "Login successful.", data: { access_token, refresh_token } };
};

// --- USER INFORMATION ---
const getUserInforService = async (userId: number): Promise<ServiceResponse> => {
  if (!userId) {
    return { errCode: 1, message: "Missing required user ID." };
  }
  // ENHANCEMENT 2: The defaultScope automatically excludes the password.
  const user = await db.User.findOne({
    where: { id: userId, status: 1 },
    include: [{ model: db.Role, as: "roleData", attributes: ["roleId", "roleName"] }],
  });
  if (!user) {
    return { errCode: 2, message: "User not found." };
  }
  // Fetch favourites separately. This logic is fine.
  const favourites = await db.Favourite.findAll({
      where: { userId: user.id },
      attributes: ['productId'],
      raw: true, // `raw: true` is important, it returns plain objects
  });

  const favouriteProductIds = Array.isArray(favourites)
    ? favourites.map((f: { productId: number }) => f.productId)
    : [];

  return { errCode: 0, message: "Get user info successful.", data: { user, favourites } };
};

// --- ADMIN USER CREATION (Transactional) ---
const createNewUserService = async (data: UserCreationData): Promise<ServiceResponse> => {
  const { email, userName, password, roleId, phoneNumber } = data;
  if (!email || !userName || !password || !roleId || !phoneNumber) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  // ENHANCEMENT 1: Wrap the entire creation in a transaction.
  try {
    const result = await sequelize.transaction(async (t) => {
      // Check for existing user in a single, efficient query.
      const existingUser = await db.User.findOne({
        where: { [Op.or]: [{ email }, { phoneNumber }] },
        transaction: t,
      });

      if (existingUser) {
        const message = existingUser.email === email ? "Email is already in use." : "Phone number is already in use.";
        // We must throw an error to abort the transaction.
        throw new Error(message);
      }

      const token = uuidv4();
      const newUser = await db.User.create({
        ...data,
        tokenRegister: token,
        status: 1, // Admin-created users are active by default
      }, { transaction: t });

      if (data.address) {
        await db.Delivery_Address.create({
          userId: newUser.id,
          address: data.address,
        }, { transaction: t });
      }

      await emailService.sendLinkAuthenEmail({ email, userName, token });
      return { errCode: 0, message: "User created successfully." };
    });
    return result;
  } catch (error: any) {
    // Check for our custom error message from the duplicate check.
    if (error.message.includes("already in use")) {
      return { errCode: 2, message: error.message };
    }
    console.error("User creation transaction failed:", error);
    throw error; // Let asyncHandler handle other unexpected errors.
  }
};

// --- UPDATE (The Transactional Method) ---
const updateUserService = async (data: UserUpdateData): Promise<ServiceResponse> => {
  const { id, email, userName, roleId, phoneNumber } = data;
  if (!id || !email || !userName || !roleId) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  // ENHANCEMENT 1: Wrap the entire multi-step update in a transaction.
  try {
    const result = await sequelize.transaction(async (t) => {
      const userToUpdate = await db.User.findByPk(id, { transaction: t });
      if (!userToUpdate) {
        throw new Error("User not found."); // This will abort the transaction
      }

      // ENHANCEMENT 2 & 3: Efficiently and correctly check for duplicates.
      if (email || phoneNumber) {
        const existingUser = await db.User.findOne({
          where: {
            [Op.or]: [{ email }, { phoneNumber }],
            id: { [Op.ne]: id }, // Exclude the current user from the check
          },
          transaction: t,
        });

        if (existingUser) {
          const message = existingUser.email === email ? "Email is already in use." : "Phone number is already in use.";
          throw new Error(message);
        }
      }

      // Update avatar if a new one is provided
      if (data.avatarUrl && data.avatarId && userToUpdate.avatarId) {
        await cloudinary.uploader.destroy(userToUpdate.avatarId);
      }

      // Update the user's main details
      // The `beforeSave` hook will automatically hash the password if it's included in `data`.
      await userToUpdate.update(data, { transaction: t });

      // Update or create the delivery address
      if (data.address) {
        const [deliveryAddress, created] = await db.Delivery_Address.findOrCreate({
          where: { userId: id },
          defaults: { userId: id, address: data.address },
          transaction: t,
        });

        if (!created) {
          deliveryAddress.address = data.address;
          await deliveryAddress.save({ transaction: t });
        }
      }

      return { errCode: 0, message: "User updated successfully." };
    });
    return result;
  } catch (error: any) {
    // Handle our custom errors from the duplicate check
    if (error.message.includes("already in use") || error.message.includes("not found")) {
      return { errCode: 2, message: error.message };
    }
    console.error("User update transaction failed:", error);
    throw error; // Let asyncHandler handle other unexpected errors
  }
};

// --- DELETE ---
const deleteUserService = async (id: number): Promise<ServiceResponse> => {
  if (!id) {
    return { errCode: 1, message: "Missing required user ID!" };
  }

  // Find the user first to get their avatarId for deletion
  const user = await db.User.findByPk(id);
  if (!user) {
    return { errCode: 2, message: "User not found." };
  }

  // If they have an avatar, delete it from Cloudinary
  if (user.avatarId) {
    await cloudinary.uploader.destroy(user.avatarId);
  }

  // Now, delete the user from the database
  await user.destroy();
  return { errCode: 0, message: "User deleted successfully." };
};

// --- USER REGISTRATION & ACTIVATION ---
const registerService = async (data: any): Promise<ServiceResponse> => {
  const { email, userName, password, roleId } = data;
  if (!email || !userName || !password || !roleId) {
    return { errCode: 1, message: "Missing required parameters!" };
  }
  // ENHANCEMENT 1: Use a transaction for this multi-step, critical operation.
  try {
    const result = await sequelize.transaction(async (t) => {
      // Find a user, even if their account is not yet active (status: 0)
      const existingUser = await db.User.findOne({ where: { email }, transaction: t });
      if (existingUser && existingUser.status === 1) {
        // If the user exists and is already active, it's a conflict.
        return { errCode: 2, message: "This email is already in use." };
      }

      const token = uuidv4();

      if (existingUser) {
        // If user exists but is not active, update their record with a new password and token
        await existingUser.update({ password, tokenRegister: token }, { transaction: t });
      } else {
        // If user does not exist at all, create them
        await db.User.create({
          email,
          userName,
          password, // The `beforeSave` hook in the model will hash this automatically
          roleId,
          tokenRegister: token,
          status: 0, // Not active
        }, { transaction: t });
      }

      await emailService.sendLinkAuthenEmail({ email, userName, token });
      return { errCode: 0, message: "Registration successful. Please check your email to activate your account." };
    });
    return result;
  } catch (error) {
    console.error("Registration transaction failed:", error);
    throw error; // Let asyncHandler handle it
  }
};

const autherRegister = async (token: string): Promise<ServiceResponse> => {
  if (!token) {
    return { errCode: 1, message: "Missing required token." };
  }
  const [updatedRows] = await db.User.update(
    { status: 1, tokenRegister: null }, // Activate and clear the token
    { where: { tokenRegister: token } }
  );
  if (updatedRows > 0) {
    return { errCode: 0, message: "Account activation successful." };
  } else {
    return { errCode: 2, message: "Invalid or expired activation token." };
  }
};

// --- OTP & PASSWORD RESET ---
const generateOTP = (length: number): string => {
  return Math.random().toString().substring(2, 2 + length).padStart(length, '0');
};

const sendOtpCodeService = async (email: string): Promise<ServiceResponse> => {
  const user = await db.User.findOne({ where: { email }, raw: false });
  if (!user) {
    return { errCode: 2, message: "Email not found." };
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit string
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

  await user.update({ otpCode, timeOtp: otpExpiry });

  await emailService.sendOtpResetPassword({ email, otpCode, userName: user.userName });
  return { errCode: 0, message: "OTP sent successfully. Please check your email." };
};

const changePasswordService = async (data: any): Promise<ServiceResponse> => {
  const { email, otpCode, password } = data;
  if (!email || !otpCode || !password) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  const user = await db.User.findOne({ where: { email }, raw: false });
  if (!user) {
    return { errCode: 4, message: "User not found." };
  }

  // ENHANCEMENT 2: Secure OTP check
  if (user.otpCode !== otpCode) {
    return { errCode: 2, message: "OTP code is incorrect." };
  }
  if (new Date() > user.timeOtp) {
    return { errCode: 3, message: "OTP has expired." };
  }

  // The beforeSave hook will automatically hash the new password.
  // After a successful password change, invalidate the OTP.
  user.password = password;
  user.otpCode = null;
  user.timeOtp = null;
  await user.save();

  return { errCode: 0, message: "Password changed successfully." };
};

const handleSendSMSOtpCodeService = async (id: number): Promise<ServiceResponse> => {
  const user = await db.User.findByPk(id);

  if (!user || !user.phoneNumber) {
    return { errCode: 2, message: "User or user phone number not found." };
  }

  const otp = generateOTP(6);
  const otpExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now

  try {
    const phone = user.phoneNumber.startsWith('0') ? user.phoneNumber.substring(1) : user.phoneNumber;
    const message = await twilioClient.messages.create({
      body: `Your verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: `+84${phone}`,
    });

    // Only update the user's OTP if the SMS was sent successfully
    if (message.sid) {
      user.otpCode = otp;
      user.timeOtp = otpExpiry;
      await user.save();
      return { errCode: 0, message: "OTP sent successfully via SMS." };
    } else {
      return { errCode: 1, message: "Failed to send SMS." };
    }
  } catch (error: any) {
    console.error("Twilio SMS Error:", error.message);
    return { errCode: -1, message: `Failed to send SMS: ${error.message}` };
  }
};

const changePasswordProfileService = async (data: any): Promise<ServiceResponse> => {
  const { id, currentPassword, newPassword } = data;
  if (!id || !currentPassword || !newPassword) {
    return { errCode: 1, message: "Missing required parameters!" };
  }

  // Use the 'withPassword' scope to fetch the password hash
  const user = await db.User.scope('withPassword').findByPk(id);
  if (!user) {
    return { errCode: 2, message: "User not found." };
  }

  // Use the model's built-in method to check the password
  if (!user.validPassword(currentPassword)) {
    return { errCode: 3, message: "Current password incorrect." };
  }

  if (currentPassword === newPassword) {
    return { errCode: 4, message: "New password cannot be the same as the current password." };
  }

  // The beforeSave hook automatically hashes the new password
  user.password = newPassword;
  await user.save();

  return { errCode: 0, message: "Password changed successfully." };
};

// --- USER INFORMATION ---

const getUserService = async (id: number): Promise<ServiceResponse> => {
  if (!id) {
    return { errCode: 1, message: "Missing required user ID!" };
  }

  // ENHANCEMENT: Use a single, efficient query with `include`.
  const user = await db.User.findOne({
    where: { id: id },
    attributes: {
      exclude: ["password", "avatarId", "timeOtp", "roleId", "tokenRegister", "status", "createdAt", "updatedAt"],
    },
    include: [
      {
        model: db.Role,
        as: "roleData",
        attributes: ["roleId", "roleName"],
      },
      {
        model: db.Delivery_Address,
        as: "deliveryAddresses", // Use the correct alias from the User model
        attributes: ["id", "address", "isDefault"],
      },
    ],
  });

  if (!user) {
    return { errCode: 2, message: "User not found." };
  }

  return { errCode: 0, message: "Get user successful.", data: user };
};

/**
 * @desc    Get a paginated list of all users for the admin dashboard.
 * @param   {number} [limit=10] - The number of items per page.
 * @param   {number} [page=1] - The page number to retrieve.
 * @param   {string} [sort='id,DESC'] - The sort order (e.g., 'userName,ASC').
 * @param   {string} [name] - A search term to filter users by name.
 */
const getAllUserService = async (
  limit?: number,
  page?: number,
  sort?: string,
  name?: string
): Promise<ServiceResponse> => {
  // ENHANCEMENT: Use clean, safe defaults for pagination.
  const effectiveLimit = limit || 10;
  const effectivePage = page || 1;
  const offset = (effectivePage - 1) * effectiveLimit;

  // ENHANCEMENT: Build the where clause safely and dynamically.
  const whereClause: { userName?: any } = {};
  if (name) {
    whereClause.userName = { [Op.substring]: name };
  }

  const { count, rows } = await db.User.findAndCountAll({
    where: whereClause,
    limit: effectiveLimit,
    offset,
    order: [sort ? sort.split(',') : ['id', 'DESC']],
    // The defaultScope in the User model already excludes the password.
    // We can be explicit here for clarity if needed.
    attributes: {
      exclude: ["password", "avatarId", "tokenRegister", "otpCode", "timeOtp", "roleId"],
    },
    include: [{
      model: db.Role,
      as: "roleData",
      attributes: ["roleId", "roleName"],
    }],
  });

  return {
    errCode: 0,
    data: {
      totalItems: count,
      totalPages: Math.ceil(count / effectiveLimit),
      currentPage: effectivePage,
      users: rows,
    },
    message: "Get all user success"
  };
};

/**
 * @desc    Get a list of all user roles.
 */
const getAllRoleService = async (): Promise<ServiceResponse> => {
  const roles = await db.Role.findAll({
    attributes: {
      exclude: ["createdAt", "updatedAt", "id"],
    },
    order: [['roleName', 'ASC']]
  });

  return { errCode: 0, data: roles, message: "Get role sucess" };
};

export {
  checkEmailExists,
  loginService,
  registerService,
  autherRegister,
  getUserInforService,
  handleSendSMSOtpCodeService,
  createNewUserService,
  getUserService,
  updateUserService,
  deleteUserService,
  getAllUserService,
  sendOtpCodeService,
  changePasswordService,
  changePasswordProfileService,
  getAllRoleService,
};
