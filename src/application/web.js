import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "../route/userRoutes.js";
import postRoutes from "../route/postRoutes.js";
import { errorMiddleware } from "../middleware/erorrMiddleware.js";
import connectDB from "./database.js";
import { v2 as cloudinary } from "cloudinary";
import bodyParser from "body-parser";
import { logger } from "./logger.js";

// Database Connection
connectDB();

export const web = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

web.use(bodyParser.json({ limit: "50mb" }));

web.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "35mb",
    parameterLimit: 50000,
  })
);

// Middleware
web.use(express.json());
web.use(express.urlencoded({ extended: true }));
web.use(cookieParser());
// logger middleware
web.use((req, res, next) => {
  req.time = new Date(Date.now()).toString();

  // Using logger.log to specify the log level as 'request'
  logger.info(`${req.method} ${req.hostname}${req.path} - ${req.time}`);

  next();
});

//Routes
web.use("/api/v1/users", userRoutes);
web.use("/api/v1/posts", postRoutes);

web.use(errorMiddleware);
