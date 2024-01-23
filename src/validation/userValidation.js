import Joi from "joi";

const signupUserValidation = Joi.object({
  email: Joi.string().email().max(100).required(),
  name: Joi.string().max(100).required(),
  username: Joi.string().max(100).required(),
  password: Joi.string().max(100).required(),
});

const loginUserValidation = Joi.object({
  username: Joi.string().max(100).required(),
  password: Joi.string().max(100).required(),
});

const updateUserValidation = Joi.object({
  username: Joi.string().max(100).optional(),
  userId: Joi.string().max(100).required(),
  email: Joi.string().max(100).optional(),
  password: Joi.string().max(100).optional(),
  name: Joi.string().max(100).optional(),
  profilePic: Joi.string().max(250).optional(),
  bio: Joi.string().max(250).optional(),
});

const getProfileValidation = Joi.string().max(100).required();
const followUnfollowValidation = Joi.object({
  id: Joi.string().max(100).required(),
  userId: Joi.string().max(100).required(),
});

export {
  signupUserValidation,
  loginUserValidation,
  getProfileValidation,
  updateUserValidation,
  followUnfollowValidation,
};
