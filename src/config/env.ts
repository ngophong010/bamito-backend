import dotenv from 'dotenv';
dotenv.config();

// This function checks for all required environment variables at startup.
export const validateEnv = () => {
  const requiredEnv = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'DB_HOST', // Add all other essential variables here
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
  ];

  for (const variable of requiredEnv) {
    if (!process.env[variable]) {
      // If a variable is missing, throw a clear error and crash the app.
      throw new Error(`FATAL ERROR: Environment variable ${variable} is not defined.`);
    }
  }
};

// You can also export the validated variables from here if you like
export const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!, // The '!' asserts it's not undefined
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
};