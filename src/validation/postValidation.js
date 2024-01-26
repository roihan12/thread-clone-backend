import Joi from "joi";

const createPostValidation = Joi.object({
  text: Joi.string().max(500).required(),
  img: Joi.any().optional(),
});

const getPostValidation = Joi.string().required();
const replyPostValidation = Joi.string().max(200).required();

const paginationPostValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  limit: Joi.number().min(1).positive().max(100).default(10),
});

export {
  createPostValidation,
  getPostValidation,
  replyPostValidation,
  paginationPostValidation,
};
