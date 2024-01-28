import messageService from "../service/messageService.js";

const sendMessage = async (req, res, next) => {
  const user = req.user;
  const request = req.body;

  try {
    const result = await messageService.sendMessage(user, request);
    res.status(201).json({
      status: "success",
      message: "created message successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  const { otherUserId } = req.params;
  const user = req.user;

  try {
    const result = await messageService.getMessages(user, otherUserId);
    res.status(200).json({
      status: "success",
      message: "Get messages successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  const user = req.user;

  try {
    const result = await messageService.getConversations(user);
    res.status(200).json({
      status: "success",
      message: "Get Conversations successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { sendMessage, getMessages, getConversations };
