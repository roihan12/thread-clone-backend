import Joi from "joi";

const sendMessageValidation = Joi.object({
  recipientId: Joi.string().max(100).required(),
  message: Joi.any().optional(),
  img: Joi.any().optional(),
});

const getMessageValidation = Joi.string().required();

export { sendMessageValidation, getMessageValidation };
