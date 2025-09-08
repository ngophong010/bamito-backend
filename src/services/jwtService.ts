import jwt from "jsonwebtoken";
import type { SignOptions, Secret } from "jsonwebtoken";
import dotenv from 'dotenv';
import type { ServiceResponse } from "../types/serviceResponse.js";

dotenv.config();

// --- TYPES ---
interface JwtPayload {
  id: number;
  role: string;
}

// ENHANCEMENT 3: "Fail-Fast" check for essential environment variables.
const ACCESS_KEY = process.env.ACCESS_KEY as Secret;
const REFRESH_KEY = process.env.REFRESH_KEY as Secret;
const ACCESS_TIME = process.env.ACCESS_TIME || "15m"; // Provide a sensible default
const REFRESH_TIME = process.env.REFRESH_TIME || "30d";

if (!ACCESS_KEY || !REFRESH_KEY) {
  throw new Error("FATAL ERROR: JWT secret keys are not defined in environment variables.");
}

// --- TOKEN GENERATION ---

// Note: These functions are no longer async because jwt.sign is synchronous.
export const generalAccessToken = (payload: JwtPayload): string => {
  const accessToken = jwt.sign(
    payload, ACCESS_KEY, {
    expiresIn: ACCESS_TIME,
  } as SignOptions);
  return accessToken;
};

export const generalRefreshToken = (payload: JwtPayload): string => {
  // This is now fully type-safe and error-free
  const refreshToken = jwt.sign(payload, REFRESH_KEY, {
    expiresIn: REFRESH_TIME,
  } as SignOptions);
  return refreshToken;
};

export const refreshTokenService = async (token: string): Promise<ServiceResponse> => {
  try {
    // jwt.verify can be awaited when used without a callback.
    // We must tell TypeScript what the shape of the decoded payload is.
    const decodedUser = jwt.verify(token, REFRESH_KEY) as JwtPayload;

    // If verification succeeds, generate a new access token.
    const newAccessToken = generalAccessToken({
      id: decodedUser.id,
      role: decodedUser.role,
    });

    return {
      errCode: 0,
      data: { access_token: newAccessToken },
      message: "Provide new token success"
    };
  } catch (error: unknown) {
    // If jwt.verify fails, it throws an error (e.g., TokenExpiredError, JsonWebTokenError).
     if (error instanceof Error) {
      // Inside this block, TypeScript is now smart enough to know that
      // 'error' is of type 'Error', so accessing '.name' is safe.
      console.error("Refresh token verification failed:", error.name);
    } else {
      // Handle the rare case where something other than an Error was thrown.
      console.error("An unexpected, non-error object was thrown during token refresh:", error);
    }
    
    return {
      errCode: -4,
      message: "User access denied. Please log in again.",
    };
  }
};
