import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "../route/userRoutes.js";
import postRoutes from "../route/postRoutes.js";
import { errorMiddleware } from "../middleware/erorrMiddleware.js";
import connectDB from "./database.js";

// Database Connection
connectDB();

export const web = express();
web.use(express.json());
web.use(express.urlencoded({ extended: true }));
web.use(cookieParser());

//Routes
web.use("/api/v1/users", userRoutes);
web.use("/api/v1/posts", postRoutes);

web.use(errorMiddleware);
