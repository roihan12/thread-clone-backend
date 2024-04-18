import userService from "../service/userService.js";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";

const signupUser = async (req, res, next) => {
  try {
    const result = await userService.signup(req.body);

    generateTokenAndSetCookie(result._id, res);
    res.status(201).json({
      status: "success",
      message: "Signup successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);

    generateTokenAndSetCookie(result._id, res);
    res.status(200).json({
      status: "success",
      message: "Login successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });

    res.status(200).json({
      status: "success",
      message: "Logout successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const followUnfollowUser = async (req, res, next) => {
  try {
    const request = {
      id: req.params.id,
      userId: req.user._id.toString(),
    };
    const result = await userService.followUnfollowUser(request);

    res.status(200).json({
      status: "success",
      message: result,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const request = req.body;
    const user = req.user;
    request.userId = userId;

    const result = await userService.update(user, request);

    res.status(200).json({
      status: "success",
      message: "Update Profile successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    // fecth user profile either with username or userid

    const { query } = req.params;

    const result = await userService.getProfile(query);

    res.status(200).json({
      status: "success",
      message: "Get Profile successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getSuggestedUsers = async (req, res, next) => {
  try {
    // fecth user profile either with username or userid
    const user = req.user;
    const result = await userService.getSuggested(user);

    res.status(200).json({
      status: "success",
      message: "Get Suggested successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const freezeAccount = async (req, res, next) => {
  const user = req.user;

  try {
    const result = await userService.freeze(user);

    res.status(200).json({
      status: "success",
      message: result,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export {
  signupUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
  getUserProfile,
  getSuggestedUsers,
  freezeAccount,
};
