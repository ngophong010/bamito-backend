import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import initWebRoutes from "./routes";
import connectDB from "./config/connectDB";
import cors from "cors";
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: process.env.URL_REACT,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());

initWebRoutes(app);
connectDB();

let port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log("Backend nodejs is runing on the port :" + port);
});
