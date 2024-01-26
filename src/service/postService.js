import {
  createPostValidation,
  getPostValidation,
  paginationPostValidation,
  replyPostValidation,
} from "../validation/postValidation.js";
import { validate } from "../validation/validation.js";

import { ResponseError } from "../error/responseError.js";
import User from "../model/userModel.js";
import Post from "../model/postModel.js";
import { v2 as cloudinary } from "cloudinary";

const create = async (user, request) => {
  if (request.img) {
    const uploadedResponse = await cloudinary.uploader.upload(request.img);
    request.img = uploadedResponse.secure_url;
  }

  const post = validate(createPostValidation, request);

  const currentUser = await User.findById(user._id);
  if (!currentUser) {
    throw new ResponseError(400, "error", "User not found");
  }

  if (currentUser._id.toString() !== user._id.toString()) {
    throw new ResponseError(401, "error", "Unauthorized to create post");
  }

  const maxLength = 500;

  if (post.text.length > maxLength) {
    throw new ResponseError(
      400,
      "error",
      "Text must be less than 500 characters"
    );
  }

  const newPost = new Post({
    postedBy: currentUser._id,
    text: post.text,
    img: post.img,
  });

  await newPost.save();

  return newPost;
};

const get = async (postId) => {
  postId = validate(getPostValidation, postId);

  const post = await Post.findById(postId);

  if (!post) {
    throw new ResponseError(404, "error", "Post is not found");
  }

  return post;
};

const remove = async (user, postId) => {
  postId = validate(getPostValidation, postId);

  const post = await Post.findById(postId);

  if (!post) {
    throw new ResponseError(404, "error", "Post is not found");
  }

  if (post.postedBy.toString() !== user._id.toString()) {
    throw new ResponseError(401, "error", "Unauthorized to delete post");
  }

  if (post.img) {
    const imgId = post.img.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(imgId);
  }

  await Post.findByIdAndDelete(postId);
};

const likeUnlike = async (user, postId) => {
  postId = validate(getPostValidation, postId);

  const post = await Post.findById(postId);

  if (!post) {
    throw new ResponseError(404, "error", "Post is not found");
  }

  const userLikedPost = post.likes.includes(user._id);
  let message;
  if (userLikedPost) {
    // Unlike Post
    await Post.updateOne({ _id: postId }, { $pull: { likes: user._id } });
    message = "Post unliked successfully";
    return message;
  } else {
    // Like Post
    post.likes.push(user._id);
    await post.save();
    message = "Post liked successfully";
    return message;
  }
};

const reply = async (user, postId, text) => {
  postId = validate(getPostValidation, postId);
  text = validate(replyPostValidation, text);

  const post = await Post.findById(postId);

  if (!post) {
    throw new ResponseError(404, "error", "Post is not found");
  }

  const reply = {
    userId: user._id,
    text: text,
    userProfilePic: user.profilePic,
    username: user.username,
  };

  post.replies.push(reply);

  await post.save();

  return reply;
};

const getFeed = async (user, request) => {
  request = validate(paginationPostValidation, request);

  const currentUser = await User.findById(user._id);

  if (!currentUser) {
    throw new ResponseError(404, "error", "User is not found");
  }

  const following = currentUser.following;

  const feedPosts = await Post.find({ postedBy: { $in: following } })
    .sort({
      createdAt: -1,
    })
    .limit(request.limit * 1)
    .skip((request.page - 1) * request.limit)
    .exec();

  // Get total item count for pagination
  const totalItem = await Post.countDocuments({ postedBy: { $in: following } });

  return {
    feedPosts,
    paging: {
      page: request.page,
      total_item: totalItem,
      total_page: Math.ceil(totalItem / request.limit),
    },
  };
};

const getUserPosts = async (username) => {
  username = validate(getPostValidation, username);

  const user = await User.findOne({ username });
  if (!user) {
    throw new ResponseError(404, "error", "User is not found");
  }

  const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });

  return posts;
};
export default {
  create,
  get,
  remove,
  likeUnlike,
  reply,
  getFeed,
  getUserPosts,
};
