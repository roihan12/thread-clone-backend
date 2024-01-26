import postService from "../service/postService.js";

const createPost = async (req, res, next) => {
  try {
    const user = req.user;
    const request = req.body;
    const result = await postService.create(user, request);
    res.status(201).json({
      status: "success",
      message: "created post successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getPost = async (req, res, next) => {
  try {
    const result = await postService.get(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Get post successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
const removePost = async (req, res, next) => {
  try {
    const user = req.user;
    await postService.remove(user, req.params.id);
    res.status(200).json({
      status: "success",
      message: "Delete post successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const likeUnlikePost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const user = req.user;
    const result = await postService.likeUnlike(user, postId);
    res.status(200).json({
      status: "success",
      message: result,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const replyToPost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const { text } = req.body;
    const user = req.user;
    const result = await postService.reply(user, postId, text);
    res.status(200).json({
      status: "success",
      message: "Reply to post successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getFeedPosts = async (req, res, next) => {
  try {
    const request = {
      page: req.query.page,
      limit: req.query.limit,
    };

    const user = req.user;
    const result = await postService.getFeed(user, request);
    res.status(200).json({
      status: "success",
      message: "Get feed post successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getUserPosts = async (req, res, next) => {
  const { username } = req.params;
  try {
   

    const result = await postService.getUserPosts(username);
    res.status(200).json({
      status: "success",
      message: "Get user posts successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createPost,
  getPost,
  removePost,
  likeUnlikePost,
  replyToPost,
  getFeedPosts,
  getUserPosts,
};
