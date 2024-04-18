import {
  signupUserValidation,
  loginUserValidation,
  followUnfollowValidation,
  updateUserValidation,
  getProfileValidation,
} from "../validation/userValidation.js";
import { validate } from "../validation/validation.js";
import User from "../model/userModel.js";
import { ResponseError } from "../error/responseError.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Post from "../model/postModel.js";

const signup = async (request) => {
  const user = validate(signupUserValidation, request);

  const checkUserExists = await User.findOne({
    $or: [{ email: user.email }, { username: user.username }],
  });

  if (checkUserExists) {
    throw new ResponseError(400, "error", "User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(user.password, salt);

  user.password = hashPassword;
  const newUser = new User(user);

  // Save the new user to the database
  await newUser.save();

  // Query the user after saving to exclude the password field
  const savedUser = await User.findById(newUser._id).select("-password");

  if (savedUser) {
    return savedUser;
  } else {
    throw new ResponseError(400, "error", "Invalid user data");
  }
};

const login = async (request) => {
  const user = validate(loginUserValidation, request);

  const checkUserExists = await User.findOne({ username: user.username });

  const isPasswordCorrect = await bcrypt.compare(
    user.password,
    checkUserExists?.password || ""
  );

  if (!checkUserExists || !isPasswordCorrect) {
    throw new ResponseError(400, "error", "Invalid username or password");
  }

  if (checkUserExists.isFrozen) {
    checkUserExists.isFrozen = false;
    await checkUserExists.save();
  }

  // Query the user after saving to exclude the password field
  return await User.findById(checkUserExists._id).select("-password");
};

const followUnfollowUser = async (request) => {
  const data = validate(followUnfollowValidation, request);
  const userToModify = await User.findById(data.id);
  const currentUser = await User.findById(data.userId);

  if (data.userId === data.id) {
    throw new ResponseError(
      400,
      "error",
      "You cannnot follow/unfollow yourself"
    );
  }

  if (!userToModify || !currentUser) {
    throw new ResponseError(400, "error", "User not found");
  }

  const isFollowing = currentUser.following.includes(data.id);
  let message;

  if (isFollowing) {
    //Unfollow user

    await User.findByIdAndUpdate(data.id, {
      $pull: { followers: data.userId },
    });
    await User.findByIdAndUpdate(data.userId, {
      $pull: { following: data.id },
    });

    message = "User unfollowed successfully";
    return message;
  } else {
    //Follow user
    await User.findByIdAndUpdate(data.id, {
      $push: { followers: data.userId },
    });
    await User.findByIdAndUpdate(data.userId, {
      $push: { following: data.id },
    });

    message = "User followed successfully";
    return message;
  }
};

const update = async (updateUser, request) => {
  if (request.profilePic) {
    if (updateUser.profilePic) {
      await cloudinary.uploader.destroy(
        updateUser.profilePic.split("/").pop().split(".")[0]
      );
    }
    const uploadedResponse = await cloudinary.uploader.upload(
      request.profilePic
    );
    request.profilePic = uploadedResponse.secure_url;
  }

  const user = validate(updateUserValidation, request);

  let currentUser = await User.findById(user.userId);

  if (!currentUser) {
    throw new ResponseError(400, "error", "User not found");
  }

  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);
    currentUser.password = hashPassword;
  }

  currentUser.name = user.name || currentUser.name;
  currentUser.email = user.email || currentUser.email;
  currentUser.username = user.username || currentUser.username;
  currentUser.profilePic = user.profilePic || currentUser.profilePic;
  currentUser.bio = user.bio || currentUser.bio;

  currentUser = await currentUser.save();

  // Find all posts that this user replied and update username and userProfilePic fields

  await Post.updateMany(
    {
      "replies.userId": user.userId,
    },
    {
      $set: {
        "replies.$[reply].username": currentUser.username,
        "replies.$[reply].userProfilePic": currentUser.profilePic,
      },
    },
    {
      arrayFilters: [{ "reply.userId": user.userId }],
    }
  );

  currentUser.password = null;
  return currentUser;
};

const getProfile = async (query) => {
  query = validate(getProfileValidation, query);

  let user;
  if (mongoose.Types.ObjectId.isValid(query)) {
    user = await User.findOne({ _id: query })
      .select("-password")
      .select("-updatedAt");
  } else {
    user = await User.findOne({ username: query })
      .select("-password")
      .select("-updatedAt");
  }

  if (!user) {
    throw new ResponseError(400, "error", "User not found");
  }

  return user;
};

const getSuggested = async (user) => {
  // Exclude the current user from suggested users and exclude users that the current user is already following
  const userId = user._id;

  const usersFollowedByYou = await User.findById(userId).select("following");

  if (!usersFollowedByYou) {
    throw new ResponseError(400, "error", "User not found");
  }

  const users = await User.aggregate([
    {
      $match: {
        _id: { $ne: userId },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        username: 1,
        email: 1,
        profilePic: 1,
        followers: 1,
        following: 1,
        bio: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $sample: { size: 10 },
    },
  ]);

  const filteredUsers = users.filter(
    (user) => !usersFollowedByYou.following.includes(user._id)
  );
  const suggestedUsers = filteredUsers.slice(0, 4);
  // suggestedUsers.forEach((user) => (user.password = null));
  return suggestedUsers;
};

const freeze = async (user) => {
  const currentUser = await User.findById(user._id);

  if (!currentUser) {
    throw new ResponseError(400, "error", "User not found");
  }

  currentUser.isFrozen = true;
  await currentUser.save();
  const message = "Freeze account successfully";
  return message;
};

export default {
  signup,
  login,
  followUnfollowUser,
  update,
  getProfile,
  getSuggested,
  freeze,
};
