import express from "express";
import {
  createPost,
  getPost,
  removePost,
  likeUnlikePost,
  replyToPost,
  getFeedPosts,
  getUserPosts
} from "../controller/postController.js";
import protectedRoute from "../middleware/protectedRouteMiddleware.js";
const router = express.Router();

router.get("/feed", protectedRoute, getFeedPosts);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
router.post("/create", protectedRoute, createPost);
router.delete("/:id", protectedRoute, removePost);
router.put("/like/:id", protectedRoute, likeUnlikePost);
router.put("/reply/:id", protectedRoute, replyToPost);

export default router;
