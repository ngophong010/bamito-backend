import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from 'dotenv';

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("FATAL ERROR: Cloudinary environment variables are not configured.");
  throw new Error("Cloudinary environment variables must be set.");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Define a type for the Cloudinary params for better type safety
interface CloudinaryParams {
  folder: string;
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Pass the configured instance
  params: {
    folder: "Badminton",
  } as CloudinaryParams, // Cast to our interface for strictness
});

const uploadImage = multer({
  storage: storage,
  // Optional: Add file size limits, etc.
  limits: {
    fileSize: 1024 * 1024 * 5 // 5 MB file size limit
  }
});

export {uploadImage};
