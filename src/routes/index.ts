import express from "express";
import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/user/user.routes.js';
import productRoutes from '../modules/product/product.routes.js';
import categoryRoutes from '../modules/category/category.routes.js';
import brandRoutes from '../modules/brand/brand.routes.js';
import sizeRoutes from '../modules/size/size.routes.js';
import inventoryRoutes from '../modules/inventory/inventory.routes.js';
import voucherRoutes from '../modules/voucher/voucher.routes.js';
import feedbackRoutes from '../modules/feedback/feedback.routes.js';
import { profileRouter as addressProfileRoutes, addressRouter } from '../modules/address/deliveryAddress.routes.js';
import cartRoutes from '../modules/cart/cart.routes.js';
import orderRoutes from '../modules/order/order.routes.js';
import paymentRoutes from '../modules/payment/payment.routes.js';

// --- Initialize the v1 router ---
const v1Router = Router();

// ===============================================================
// --- MOUNT ALL THE ROUTERS ---
// ===============================================================
// This is the "switchboard" for your entire API.

// --- Authentication & Profile Routes ---
v1Router.use('/auth', authRoutes);                   // For login, register, password reset, etc.
v1Router.use('/profile/cart', cartRoutes);           // For the logged-in user's cart
v1Router.use('/profile/addresses', addressProfileRoutes); // For the logged-in user's address book

// --- Product Catalog Routes ---
v1Router.use('/products', productRoutes);            // Includes nested /:productId/inventory and /:productId/feedback
v1Router.use('/categories', categoryRoutes);         // Formerly product-types
v1Router.use('/brands', brandRoutes);
v1Router.use('/sizes', sizeRoutes);
v1Router.use('/vouchers', voucherRoutes);

// --- Direct Resource Management Routes (Mostly for Admins) ---
v1Router.use('/users', userRoutes);                  // For admins to manage all users
v1Router.use('/orders', orderRoutes);                // For admins to manage all orders
v1Router.use('/inventory', inventoryRoutes);         // For admins to directly update/delete inventory entries
v1Router.use('/feedback', feedbackRoutes);           // For admins/owners to update/delete specific feedback
v1Router.use('/addresses', addressRouter);           // For owners to update/delete a specific address

// --- Payment Gateway Routes ---
v1Router.use('/payment', paymentRoutes);

// The main router for the entire API now just uses the versioned router.
const apiRouter = Router();
apiRouter.use('/v1', v1Router);

export default apiRouter;
