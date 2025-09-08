import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';

import * as productService from "../services/productService.js";
import { getAllProductFavouriteService } from "../services/favouriteService.js"
import { getAllFeedbackService } from "../services/feedBackService.js"
import type { FilterOptions } from "../types/shared.js";

// 2. Use a Promise to handle the stream-based upload from the buffer.
const uploadStream = (file: Express.Multer.File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "Badminton" }, // Your folder in Cloudinary
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    // Pipe the file buffer from memory into the upload stream
    stream.end(file.buffer);
  });
};

const handleCreateNewProduct = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If validation fails, the file was still uploaded, so we must clean it up.
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    res.status(400).json({ errors: errors.array() });
    return;
  }

  if (!req.file) {
    res.status(400).json({
      errors: [{
        type: 'file',
        msg: 'An image file is required.',
        path: 'image',
        location: 'body'
      }]
    });
    return;
  }

  // Create a variable for the file to use in the catch block.
  const uploadedFile = req.file;

  try {
    // 3. Await the upload and get the result from Cloudinary.
    const uploadResult = await uploadStream(uploadedFile);

    // 4. Combine the Cloudinary data with your form data.
    const data = {
      ...req.body,
      imageUrl: uploadResult.secure_url,
      imageId: uploadResult.public_id,
    };
    
    // 5. Call your service with the complete data.
    const message = await productService.createNewProductService(data);

    if (message.errCode !== 0) {
      // If the service fails, we still have the filename to delete.
      await cloudinary.uploader.destroy(uploadResult.public_id);
      res.status(400).json(message);
      return;
    }

    res.status(201).json(message);
  } catch (error) {
    if (uploadedFile) await cloudinary.uploader.destroy(uploadedFile.filename);
    throw error; // Re-throw the error to be caught by asyncHandler
  }
});

const handleUpdateProduct = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const id = Number(req.params.id);
    const data = { id, ...req.body, imageUrl: req.file?.path, imageId: req.file?.filename };
    const message = await productService.updateProductService(data);

    if (message.errCode !== 0) {
      if (req.file) await cloudinary.uploader.destroy(req.file.filename);
      res.status(404).json(message);
      return;
    }
    res.status(200).json(message);
  } catch (error) {
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    throw error;
  }
});

const handleDeleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  };

  const id = Number(req.params.id);
  const message = await productService.deleteProductService(id);
  res.status(message.errCode === 0 ? 200 : 404).json(message);
});

// --- PUBLIC-FACING PRODUCT QUERIES ---

const handleGetProduct = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  };
  
  const { productId } = req.params; // Get from params for a RESTful URL
  const message = await productService.getProductService(productId as string);
  res.status(message.errCode === 0 ? 200 : 404).json(message);
});

const handleGetAllProduct = asyncHandler(async (req: Request, res: Response) => {
  const { limit, page, sort, name } = req.query;
  const message = await productService.getAllProductService(
    Number(limit) || undefined,
    Number(page) || undefined,
    sort as string,
    name as string
  );
  res.status(200).json(message);
});

const handleGetAllProductOfTheProductType = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  };
  
  // Let the router's validation handle the complex parsing.
  const { limit, page, sort, filter } = req.query;
  const { productTypeId } = req.params;

  const message = await productService.getAllProductOfTheProductTypeService(
    Number(productTypeId),
    Number(limit) || undefined,
    Number(page) || undefined,
    sort as string,
    filter as FilterOptions
  );
  res.status(200).json(message);
});

const handleGetAllFeedBack = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  const productId = Number(req.query.productId);
  const message = await getAllFeedbackService(productId);
  res.status(message.errCode === 0 ? 200 : 400).json(message);
});

const handleGetAllProductSaleOff = asyncHandler(async (req: Request, res: Response) => {
    const { limit, page } = req.query;
    const message = await productService.getAllProductSaleOffService(
        Number(limit) || undefined,
        Number(page) || undefined,
    );
    res.status(200).json(message);
});

const handleGetAllUserFavourites = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // Safely parse parameters with defaults
  const userId = Number(req.params.id);
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  // Assuming you have a 'getAllProductFavouriteService' in 'favouriteService.ts'
  const message = await getAllProductFavouriteService(userId, limit, page);
  res.status(200).json(message);
});

export {
  handleCreateNewProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleGetProduct,
  handleGetAllProduct,
  handleGetAllProductOfTheProductType,
  handleGetAllFeedBack,
  handleGetAllProductSaleOff,
  handleGetAllUserFavourites,
};
