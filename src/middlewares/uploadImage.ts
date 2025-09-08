import { v2 as cloudinary } from 'cloudinary';
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

// 1. Use Multer's MemoryStorage engine.
// This tells Multer to store the file as a Buffer in memory (req.file.buffer).
const storage = multer.memoryStorage()

// 2. Optional: Create a file filter to validate the file type on the server.
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept the file
  } else {
    // Reject the file and provide a specific error message
    cb(new Error('File type not supported! Please upload an image.'), false);
  }
};

// 3. Create the final Multer middleware instance.
const uploadImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5 MB file size limit
  }
});

export {uploadImage};
