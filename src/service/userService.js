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

const update = async (request) => {
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

  return currentUser;
};

const getProfile = async (username) => {
  username = validate(getProfileValidation, username);

  const user = await User.findOne({ username })
    .select("-password")
    .select("-updatedAt");
  if (!user) {
    throw new ResponseError(400, "error", "User not found");
  }

  return user;
};

export default { signup, login, followUnfollowUser, update, getProfile };
