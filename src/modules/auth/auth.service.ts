import { prisma } from "../../lib/prisma.js";
import { v4 as uuidv4 } from "uuid";
import type { Prisma } from "@prisma/client";

// --- Import low-level utilities ---
import { hashPassword, comparePassword } from "../../utils/password.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import * as emailService from "../../utils/email.js";

type UserCreateInput = Prisma.UserCreateInput;



/**
 * Verifies user credentials and issues JWTs.
 */
export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: { role: { select: { roleId: true } } },
    });

    if (!user || user.status !== 1) {
        throw new Error("Invalid credentials or account not activated.");
    }

    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
        throw new Error("Invalid credentials or account not activated.");
    }

    const userPayload = { id: user.id, role: user.role.roleId };
    const accessToken = await generateAccessToken(userPayload);
    const refreshToken = await generateRefreshToken(userPayload);
    
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
};

/**
 * Registers a new, inactive user and sends an activation email.
 */
export const registerUser = async (data: UserCreateInput) => {
    const { email, userName, password, roleId } = data;
    if (!email || !userName || !password || !roleId) {
        throw new Error("Missing required parameters!");
    }

    return prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({ where: { email } });
        if (existingUser && existingUser.status === 1) {
            throw new Error("This email is already in use.");
        }

        const hashedPassword = await hashPassword(password);
        const token = uuidv4();

        const user = await tx.user.upsert({
            where: { email },
            update: { password: hashedPassword, tokenRegister: token },
            create: { email, userName, password: hashedPassword, roleId, tokenRegister: token, status: 0 },
        });

        await emailService.sendLinkAuthenEmail({ email: user.email, userName: user.userName, token });
        return user;
    });
};

/**
 * Activates a user's account using a registration token.
 */
export const activateUserAccount = async (token: string) => {
    if (!token) throw new Error("Missing required token.");

    const result = await prisma.user.updateMany({
        where: { tokenRegister: token },
        data: { status: 1, tokenRegister: null },
    });

    if (result.count === 0) {
        throw new Error("Invalid or expired activation token.");
    }
};

/**
 * [PRIVATE HELPER] Generates an OTP, sets its expiry, and saves it to a user.
 * This is the single source of truth for OTP logic.
 * @param userId The ID of the user to update.
 * @param expiryInMinutes The lifespan of the OTP in minutes.
 * @returns The generated OTP code.
 */
const _generateAndSaveOtp = async (userId: number, expiryInMinutes: number): Promise<string> => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const timeOtp = new Date(Date.now() + expiryInMinutes * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { otpCode, timeOtp },
  });

  return otpCode;
};

/**
 * [PUBLIC SERVICE] Initiates the password reset process by sending an OTP to the user's email.
 * @param email The email address of the user requesting a password reset.
 */
export const sendPasswordResetOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // We don't throw an error here for security reasons.
    // We don't want to confirm to an attacker whether an email exists or not.
    console.warn(`Password reset attempt for non-existent email: ${email}`);
    return; // Silently fail
  }

  // Use the private helper to handle the OTP logic
  const otpCode = await _generateAndSaveOtp(user.id, 5); // 5-minute expiry for email OTP

  // Complete the business process by sending the email
  await emailService.sendOtpResetPassword({ email, otpCode, userName: user.userName });
};

/**
 * [PUBLIC SERVICE] Resets a user's password after they provide a valid OTP.
 */
export const resetUserPassword = async (email: string, otpCode: string, newPassword: string) => {
  // The logic for verifying the OTP remains here because it's part of the password reset business process.
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.otpCode || !user.timeOtp) throw new Error("Invalid request or user not found.");
  if (user.otpCode !== otpCode) throw new Error("OTP code is incorrect.");
  if (new Date() > user.timeOtp) throw new Error("OTP has expired.");

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword, otpCode: null, timeOtp: null }, // Invalidate the OTP
  });
};

/**
 * Issues a new access token if the provided refresh token is valid.
 */
export const refreshAccessToken = async (token: string) => {
    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({
        where: { id: decoded.id, status: 1 },
        include: { role: { select: { roleId: true } } },
    });

    if (!user) throw new Error("Authentication failed.");

    const newAccessToken = await generateAccessToken({ id: user.id, role: user.role.roleId });
    return { newAccessToken };
};
