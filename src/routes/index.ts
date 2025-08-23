import express from "express";

import userRouter from "./userRouter.js";
import productRouter from "./productRouter.js";
import productTypeRouter from "./productTypeRouter.js";
import brandRouter from "./brandRouter.js";
import favouriteRouter from "./favouriteRouter.js";
import sizeRouter from "./sizeRouter.js";
import voucherRouter from "./voucherRouter.js";
import productSizeRouter from "./productSizeRouter.js";
import feedBackRouter from "./feedBackRouter.js";
import cartRouter from "./cartRouter.js";
import orderRouter from "./orderRouter.js";

const apiRouter = express.Router();

// --- ENHANCEMENT 2: Add any middleware that should apply to ALL API routes ---
// This simple logger will run for every single API request, which is great for debugging.
apiRouter.use((req, res, next) => {
  console.log(`[API] Request received: ${req.method} ${req.originalUrl}`);
  next();
});

// --- ENHANCEMENT 1: Create a versioned router ---
const v1Router = express.Router();

// Mount all your resource routers onto the v1Router
v1Router.use("/users", userRouter); // Best practice: use plural resource names
v1Router.use("/product-types", productTypeRouter);
v1Router.use("/products", productRouter);
v1Router.use("/brands", brandRouter);
v1Router.use("/favourites", favouriteRouter);
v1Router.use("/sizes", sizeRouter);
v1Router.use("/vouchers", voucherRouter);
v1Router.use("/product-sizes", productSizeRouter);
v1Router.use("/feedback", feedBackRouter);
v1Router.use("/cart", cartRouter);
v1Router.use("/orders", orderRouter);

// Mount the versioned router onto the main apiRouter
apiRouter.use("/v1", v1Router);

export default apiRouter;
