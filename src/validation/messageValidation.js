import Joi from "joi";

const sendMessageValidation = Joi.object({
  recipientId: Joi.string().max(100).required(),
  message: Joi.string().max(500).required(),
});

const getMessageValidation = Joi.string().required();

export { sendMessageValidation, getMessageValidation };
