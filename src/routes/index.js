import userRouter from "./userRouter";
import productRouter from "./productRouter";
import productTypeRouter from "./productTypeRouter";
import brandRouter from "./brandRouter";
import favouriteRouter from "./favouriteRouter";
import sizeRouter from "./sizeRouter";
import voucherRouter from "./voucherRouter";
import productSizeRouter from "./productSizeRouter";
import feedBackRouter from "./feedBackRouter";
import cartRouter from "./cartRouter";
import orderRouter from "./orderRouter";

let initWebRoutes = (app) => {
  app.use("/api/user", userRouter);
  app.use("/api/product-type", productTypeRouter);
  app.use("/api/product", productRouter);
  app.use("/api/product", productRouter);
  app.use("/api/brand", brandRouter);
  app.use("/api/favourite", favouriteRouter);
  app.use("/api/size", sizeRouter);
  app.use("/api/voucher", voucherRouter);
  app.use("/api/product-size", productSizeRouter);
  app.use("/api/feedback", feedBackRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/order", orderRouter);
};

export default initWebRoutes;
