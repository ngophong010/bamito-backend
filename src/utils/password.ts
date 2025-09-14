import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // The cost factor for hashing. 10 is a good default.

/**
 * Hashes a plain-text password using bcrypt.
 * @param password The plain-text password to hash.
 * @returns A promise that resolves to the hashed password string.
 */
export const hashPassword = async (password: string): Promise<string> => {
  if (!password) {
    throw new Error("Password cannot be empty.");
  }
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

/**
 * Compares a plain-text password with a hashed password.
 * @param plainPassword The plain-text password from a user's login attempt.
 * @param hashedPassword The hashed password stored in the database.
 * @returns A promise that resolves to true if the passwords match, false otherwise.
 */
export const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  if (!plainPassword || !hashedPassword) {
    return false;
  }
  return bcrypt.compare(plainPassword, hashedPassword);
};
