import express from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
  getUserProfile,
  getSuggestedUsers,
  freezeAccount,
} from "../controller/userController.js";
import protectedRoute from "../middleware/protectedRouteMiddleware.js";
const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectedRoute, followUnfollowUser);
router.put("/update", protectedRoute, updateUser);
router.put("/freeze", protectedRoute, freezeAccount);
router.get("/profile/:query", getUserProfile);
router.get("/suggested", protectedRoute, getSuggestedUsers);

export default router;
