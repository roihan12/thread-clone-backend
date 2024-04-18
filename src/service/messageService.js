import {
  getMessageValidation,
  sendMessageValidation,
} from "../validation/messageValidation.js";
import { validate } from "../validation/validation.js";

import { ResponseError } from "../error/responseError.js";
import User from "../model/userModel.js";
import Conversation from "../model/conversationModel.js";
import Message from "../model/messageModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";

const sendMessage = async (user, request) => {
  if (request.img) {
    const uploadedResponse = await cloudinary.uploader.upload(request.img);
    request.img = uploadedResponse.secure_url;
  }

  const newConversation = validate(sendMessageValidation, request);

  if (user._id === newConversation.recipientId) {
    throw new ResponseError(400, "error", "You cannot message yourself");
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [user._id, newConversation.recipientId] },
  });

  if (!conversation) {
    conversation = new Conversation({
      participants: [user._id, newConversation.recipientId],
      lastMessage: {
        text: newConversation.message,
        sender: user._id,
      },
    });

    await conversation.save();
  }

  const newMessage = new Message({
    conversationId: conversation._id,
    sender: user._id,
    text: newConversation.message,
    img: newConversation.img || "",
  });

  await Promise.all([
    newMessage.save(),
    conversation.updateOne({
      lastMessage: {
        text: newConversation.message,
        sender: user._id,
      },
    }),
  ]);

  const recipientSocketId = getRecipientSocketId(newConversation.recipientId);
  if (recipientSocketId) {
    io.to(recipientSocketId).emit("newMessage", newMessage);
  }

  return newMessage;
};

const getMessages = async (user, otherUserId) => {
  otherUserId = validate(getMessageValidation, otherUserId);

  const conversation = await Conversation.findOne({
    participants: { $all: [user._id, otherUserId] },
  });

  if (!conversation) {
    throw new ResponseError(404, "error", "Conversation is not found");
  }

  const messages = await Message.find({
    conversationId: conversation._id,
  }).sort({ createdAt: 1 });

  return messages;
};

const getConversations = async (user) => {
  const conversations = await Conversation.find({
    participants: user._id,
  }).populate({
    path: "participants",
    select: "username profilePic",
  });

  if (!conversations) {
    throw new ResponseError(404, "error", "Conversation is not found");
  }

  //remove the current user the participant array

  conversations.forEach((conversation) => {
    conversation.participants = conversation.participants.filter(
      (participants) => participants._id.toString() !== user._id.toString()
    );
  });

  return conversations;
};

export default { sendMessage, getMessages, getConversations };
