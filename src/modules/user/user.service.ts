import { prisma } from "../../lib/prisma.js";
import { v4 as uuidv4 } from "uuid";
import twilio from "twilio";
import { v2 as cloudinary } from 'cloudinary';
import type { Prisma } from "@prisma/client";

// --- Assume these helpers exist ---
import { hashPassword, comparePassword } from "../../utils/password.js";
import { sendSms } from "../../utils/sms.js"; // Assuming a dedicated SMS utility
import {_handleGenerateAndSaveOtp as _generateAndSaveOtp} from "./user.private.service.js";

// Use a more specific type for admin creation to include the optional address
interface AdminUserCreateInput extends Prisma.UserCreateInput {
  address?: string;
}

// Use Prisma's auto-generated types
type UserCreateInput = Prisma.UserCreateInput;
type UserUpdateInput = Prisma.UserUpdateInput;

// ===============================================================
// --- USER PROFILE MANAGEMENT ---
// ===============================================================

export const getProfile = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId, status: 1 },
        select: {
            id: true, userName: true, email: true, avatar: true, phoneNumber: true, birthday: true,
            role: { select: { roleId: true, roleName: true } },
        },
    });

    if (!user) throw new Error("User not found.");

    const favourites = await prisma.favourite.findMany({
        where: { userId: user.id },
        select: { productId: true },
    });

    return { user, favourites: favourites.map(f => f.productId) };
};

export const updateProfile = async (id: number, data: UserUpdateInput, newAvatarFile?: { path: string, filename: string }) => {
    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) throw new Error("User not found.");

    if (newAvatarFile && userToUpdate.avatarId) {
        await cloudinary.uploader.destroy(userToUpdate.avatarId);
    }
    
    const updateData = { ...data };
    if (newAvatarFile) {
        updateData.avatar = newAvatarFile.path;
        updateData.avatarId = newAvatarFile.filename;
    }

    try {
        return await prisma.user.update({ where: { id }, data: updateData });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            const field = (error.meta?.target as string[])[0];
            throw new Error(`This ${field} is already in use.`);
        }
        throw error;
    }
};

export const changePasswordInProfile = async (id: number, currentPassword: string, newPassword: string) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found.");

    const isPasswordCorrect = await comparePassword(currentPassword, user.password);
    if (!isPasswordCorrect) throw new Error("Current password incorrect.");
    if (currentPassword === newPassword) throw new Error("New password cannot be the same as the current password.");

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({ where: { id }, data: { password: hashedPassword } });
};

/**
 * [PUBLIC SERVICE] Sends a verification OTP to a user's registered phone number.
 * This is used for actions like verifying a login or a critical profile change.
 * @param userId The ID of the user to send the SMS to.
 */
export const sendVerificationSms = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.phoneNumber) {
    throw new Error("User or user's phone number not found.");
  }

  // Use the private helper to handle the OTP logic
  const otpCode = await _generateAndSaveOtp(user.id, 3); // 3-minute expiry for SMS OTP

  // Complete the business process by sending the SMS
  await sendSms(user.phoneNumber, `Your Bamito verification code is: ${otpCode}`);
};

/**
 * [PUBLIC SERVICE] Verifies an OTP provided by a user.
 * Can be used after sending an SMS or for other 2FA-like checks.
 * @param userId The ID of the user being verified.
 * @param otpCode The OTP code provided by the user.
 * @returns True if the OTP is valid.
 * @throws An error if the OTP is invalid or expired.
 */
export const verifyOtp = async (userId: number, otpCode: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({ where: { id: userId }});
    if (!user || !user.otpCode || !user.timeOtp) throw new Error("No pending OTP found for this user.");
    if (user.otpCode !== otpCode) throw new Error("OTP code is incorrect.");
    if (new Date() > user.timeOtp) throw new Error("OTP has expired.");

    // Invalidate the OTP after a successful verification
    await prisma.user.update({
        where: { id: userId },
        data: { otpCode: null, timeOtp: null }
    });
    
    return true;
};

// ===============================================================
// --- ADMIN USER MANAGEMENT ---
// ===============================================================

export const createUserByAdmin = async (data: AdminUserCreateInput) => {
    const { email, userName, password, roleId, phoneNumber, address } = data;
    if (!email || !userName || !password || !roleId) {
        throw new Error("Missing required parameters!");
    }

    return prisma.$transaction(async (tx) => {
        if (email || phoneNumber) {
            const existingUser = await tx.user.findFirst({ where: { OR: [{ email }, { phoneNumber }] } });
            if (existingUser) {
                throw new Error(existingUser.email === email ? "Email is already in use." : "Phone number is already in use.");
            }
        }
        const hashedPassword = await hashPassword(password);
        const newUser = await tx.user.create({
            data: { email, userName, password: hashedPassword, roleId, phoneNumber, status: 1 },
        });
        if (address) {
            await tx.deliveryAddress.create({
                data: { userId: newUser.id, address, isDefault: true },
            });
        }
        return newUser;
    });
};

export const getAllUsers = async (limit = 10, page = 1, sort = "id,desc", name?: string) => {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = { userName: { contains: name, mode: 'insensitive' } };
    const [sortField, sortOrder] = sort.split(',');

    const [totalItems, users] = await prisma.$transaction([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where, skip, take: limit,
            orderBy: { [sortField]: sortOrder },
            select: { id: true, userName: true, email: true, avatar: true, phoneNumber: true, status: true, role: true }
        })
    ]);
    return { totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page, users };
};

export const deleteUser = async (id: number) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found.");
    if (user.avatarId) {
        await cloudinary.uploader.destroy(user.avatarId);
    }
    return prisma.user.delete({ where: { id } });
};

export const getAllRoles = async () => {
    return prisma.role.findMany({
        select: { id: true, roleId: true, roleName: true },
        orderBy: { roleName: 'asc' }
    });
};
