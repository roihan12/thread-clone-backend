import express from "express";
import {
  createPost,
  getPost,
  removePost,
  likeUnlikePost,
  replyToPost,
  getFeedPosts,
} from "../controller/postController.js";
import protectedRoute from "../middleware/protectedRouteMiddleware.js";
const router = express.Router();

router.get("/feed", protectedRoute, getFeedPosts);
router.get("/:id", getPost);
router.post("/create", protectedRoute, createPost);
router.delete("/:id", protectedRoute, removePost);
router.post("/like/:id", protectedRoute, likeUnlikePost);
router.post("/reply/:id", protectedRoute, replyToPost);

export default router;
