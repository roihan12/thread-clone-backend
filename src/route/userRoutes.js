import express from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
  getUserProfile
} from "../controller/userController.js";
import protectedRoute from "../middleware/protectedRouteMiddleware.js";
const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectedRoute, followUnfollowUser);
router.put("/update", protectedRoute, updateUser);
router.get("/profile/:query", getUserProfile);

export default router;
