// import { web } from "./application/web.js";
import { logger } from "./application/logger.js";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "./route/userRoutes.js";
import postRoutes from "./route/postRoutes.js";
import messageRoutes from "./route/messageRoutes.js";
import { errorMiddleware } from "./middleware/erorrMiddleware.js";
import connectDB from "./application/database.js";
import { v2 as cloudinary } from "cloudinary";
import bodyParser from "body-parser";
import { web, server } from "./socket/socket.js";
import cors from "cors";
dotenv.config();

// Database Connection
connectDB();

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

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true, //access-control-allow-credentials:true
};

web.use(cors(corsOptions));

// Middleware
web.use(express.json());
web.use(express.urlencoded({ extended: true }));
web.use(cookieParser());
// logger middleware
web.use((req, res, next) => {
  req.time = new Date(Date.now()).toString();

  // Using logger.log to specify the log level as 'request'
  // logger.info(`${req.method} ${req.hostname}${req.path} - ${req.time}`);

  next();
});

//Routes
web.use("/api/v1/users", userRoutes);
web.use("/api/v1/posts", postRoutes);
web.use("/api/v1/messages", messageRoutes);

web.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`server listening on http://localhost:${PORT}`);
});
