import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';

// Use named imports for the refactored service functions
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  getAllProducts,
  getAllProductsByCategory,
  getAllProductsOnSale,
  getUnreviewedProductsForUser, // We'll assume this is for a /profile/unreviewed route
} from "./product.service.js";

const handleCreateProduct = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If validation fails, a file may have been uploaded via multer. Clean it up.
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    res.status(400).json({ errors: errors.array() });
    return;
  }
  if (!req.file) {
    res.status(400).json({ message: 'An image file is required.' });
    return;
  }

  try {
    const data = {
      ...req.body,
      image: req.file.path,
      imageId: req.file.filename,
    };
    
    // The service now returns the created product directly
    const newProduct = await createProduct(data);
    res.status(201).json(newProduct);

  } catch (error) {
    // If the service throws ANY error (e.g., duplicate productId),
    // we must clean up the file that was successfully uploaded to Cloudinary.
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    // Re-throw the error to be caught by our global errorHandler middleware
    throw error;
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
    // The service now handles the logic of replacing the old image if a new one is provided.
    const updatedProduct = await updateProduct(id, req.body, req.file);
    res.status(200).json(updatedProduct);
  } catch (error) {
    // If the service fails for any reason, clean up the newly uploaded file.
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    throw error;
  }
});

const handleDeleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  // The service now handles deleting the image from Cloudinary internally.
  await deleteProduct(id);
  res.status(204).send(); // Standard for successful DELETE
});

// --- PUBLIC-FACING PRODUCT QUERIES ---

const handleGetProductDetails = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const productDetails = await getProductDetails(productId);
  res.status(200).json(productDetails);
});

const handleGetAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const { limit, page, sort, name } = req.query;
  const productData = await getAllProducts(
    Number(limit) || undefined,
    Number(page) || undefined,
    sort as string,
    name as string
  );
  res.status(200).json(productData);
});

const handleGetAllProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { limit, page, sort, filter } = req.query;
  const { categoryId } = req.params; // Using categoryId from URL param is more RESTful

  const productData = await getAllProductsByCategory(
    Number(categoryId),
    Number(limit) || undefined,
    Number(page) || undefined,
    sort as string,
    filter as any // Should be validated and parsed
  );
  res.status(200).json(productData);
});

const handleGetAllProductsOnSale = asyncHandler(async (req: Request, res: Response) => {
    const { limit, page } = req.query;
    const saleData = await getAllProductsOnSale(
        Number(limit) || undefined,
        Number(page) || undefined,
    );
    res.status(200).json(saleData);
});

export {
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleGetProductDetails,
  handleGetAllProducts,
  handleGetAllProductsByCategory,
  handleGetAllProductsOnSale,

};