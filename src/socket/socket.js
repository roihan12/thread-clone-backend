import { Server } from "socket.io";
import http from "http";
import express from "express";
import { logger } from "../application/logger.js";
import Message from "../model/messageModel.js";
import Conversation from "../model/conversationModel.js";
import dotenv from "dotenv";
dotenv.config();
const web = express();

const server = http.createServer(web);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

export const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

const userSocketMap = {}; //userid: socketid

io.on("connection", (socket) => {
  logger.info(`User connected, ${socket.id}`);
  const userId = socket.handshake.query.userId;

  if (userId != "undefined") userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); // convert array like [1,2, 3 ]

  socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId: conversationId, seen: false },
        { $set: { seen: true } }
      );
      await Conversation.updateOne(
        { _id: conversationId },
        { $set: { "lastMessage.seen": true } }
      );
      io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
    } catch (error) {
      logger.error(error);
    }
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected, ${socket.id}`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, web };
