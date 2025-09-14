import jwt from 'jsonwebtoken';

// --- Interfaces for Type Safety ---
// This defines the data we will store inside the JWT payload.
export interface UserPayload {
  id: number;
  role: string; // e.g., 'ADMIN', 'CUSTOMER'
}

// --- Environment Variable Validation ---
// It's a best practice to check for your secrets at startup.
// If they are missing, the application will fail to start immediately.
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || '15m';
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("JWT secrets are not defined in the environment variables!");
}


// ===============================================================
// --- TOKEN GENERATION ---
// ===============================================================

/**
 * Generates a short-lived Access Token for a user.
 * @param payload The user data to include in the token.
 * @returns The signed JWT Access Token string.
 */
export const generateAccessToken = (payload: UserPayload): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });
};

/**
 * Generates a long-lived Refresh Token for a user.
 * @param payload The user data to include in the token.
 * @returns The signed JWT Refresh Token string.
 */
export const generateRefreshToken = (payload: UserPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });
};


// ===============================================================
// --- TOKEN VERIFICATION ---
// ===============================================================

/**
 * Verifies an Access Token.
 * @param token The JWT string to verify.
 * @returns The decoded payload if the token is valid.
 * @throws An error if the token is invalid or expired.
 */
export const verifyAccessToken = (token: string): UserPayload => {
  try {
    // The `jwt.verify` function returns the decoded payload, which we cast to our UserPayload type.
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as UserPayload;
  } catch (error) {
    // The library throws errors for invalid signatures, expiration, etc.
    // We can re-throw a more generic error for our auth middleware to catch.
    throw new Error("Invalid or expired access token.");
  }
};

/**
 * Verifies a Refresh Token.
 * @param token The JWT string to verify.
 * @returns The decoded payload if the token is valid.
 * @throws An error if the token is invalid or expired.
 */
export const verifyRefreshToken = (token: string): UserPayload => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as UserPayload;
  } catch (error) {
    throw new Error("Invalid or expired refresh token.");
  }
};
