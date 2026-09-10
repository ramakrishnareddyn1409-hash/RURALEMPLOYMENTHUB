import Chat from "../models/Chat.js";
import { AppError } from "../middleware/globalErrorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";
import { getGroqResponse, formatMessages } from "../services/groqService.js";
import { generateConversationID } from "../utils/helpers.js";

// Send Chat Message
export const sendChatMessage = catchAsync(async (req, res, next) => {
  let { message, conversationID, conversationTitle } = req.body;

  if (!message) {
    return next(new AppError("Message cannot be empty", 400));
  }

  // Generate conversation ID if not provided
  if (!conversationID) {
    conversationID = generateConversationID();
  }

  // Save user message
  const userMessage = await Chat.create({
    user: req.user.id,
    conversationID,
    conversationTitle: conversationTitle || "New Conversation",
    role: "user",
    message,
  });

  // Get conversation history (last 5 messages)
  const history = await Chat.find({ conversationID, user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Format messages for AI
  const formattedMessages = formatMessages(
    message,
    history.reverse().map((h) => ({
      role: h.role,
      content: h.message,
    }))
  );

  // Get AI Response
  const aiResponse = await getGroqResponse(formattedMessages);

  if (!aiResponse.success) {
    return res.status(500).json({
      status: "error",
      message: aiResponse.message,
      error: aiResponse.error,
    });
  }

  // Save AI response
  const assistantMessage = await Chat.create({
    user: req.user.id,
    conversationID,
    conversationTitle: conversationTitle || "New Conversation",
    role: "assistant",
    message: aiResponse.message,
    aiModel: aiResponse.model,
    tokens: aiResponse.usage,
  });

  res.status(201).json({
    status: "success",
    conversationID,
    userMessage,
    assistantMessage: {
      _id: assistantMessage._id,
      role: "assistant",
      message: assistantMessage.message,
      createdAt: assistantMessage.createdAt,
    },
  });
});

// Get Conversation
export const getConversation = catchAsync(async (req, res, next) => {
  const { conversationID } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const messages = await Chat.find({
    user: req.user.id,
    conversationID,
  })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: 1 });

  const total = await Chat.countDocuments({
    user: req.user.id,
    conversationID,
  });

  if (messages.length === 0) {
    return next(new AppError("Conversation not found", 404));
  }

  res.status(200).json({
    status: "success",
    total,
    page,
    pages: Math.ceil(total / limit),
    conversationTitle: messages[0].conversationTitle,
    messages,
  });
});

// Get All Conversations
export const getAllConversations = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Get distinct conversations
  const conversations = await Chat.aggregate([
    { $match: { user: req.user.id } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$conversationID",
        title: { $first: "$conversationTitle" },
        lastMessage: { $first: "$message" },
        createdAt: { $first: "$createdAt" },
        messageCount: { $sum: 1 },
      },
    },
    { $skip: skip },
    { $limit: limit },
  ]);

  const total = await Chat.distinct("conversationID", { user: req.user.id }).then(
    (arr) => arr.length
  );

  res.status(200).json({
    status: "success",
    total,
    page,
    pages: Math.ceil(total / limit),
    conversations,
  });
});

// Rename Conversation
export const renameConversation = catchAsync(async (req, res, next) => {
  const { conversationID } = req.params;
  const { title } = req.body;

  if (!title) {
    return next(new AppError("Title is required", 400));
  }

  const result = await Chat.updateMany(
    { user: req.user.id, conversationID },
    { conversationTitle: title }
  );

  if (result.modifiedCount === 0) {
    return next(new AppError("Conversation not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Conversation renamed successfully",
  });
});

// Delete Conversation
export const deleteConversation = catchAsync(async (req, res, next) => {
  const { conversationID } = req.params;

  const result = await Chat.deleteMany({
    user: req.user.id,
    conversationID,
  });

  if (result.deletedCount === 0) {
    return next(new AppError("Conversation not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Conversation deleted successfully",
  });
});

// Clear All Conversations
export const clearAllConversations = catchAsync(async (req, res, next) => {
  const result = await Chat.deleteMany({ user: req.user.id });

  res.status(200).json({
    status: "success",
    message: "All conversations cleared",
    deletedCount: result.deletedCount,
  });
});

// Search Conversations
export const searchConversations = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new AppError("Search query is required", 400));
  }

  const results = await Chat.find({
    user: req.user.id,
    $or: [
      { message: { $regex: query, $options: "i" } },
      { conversationTitle: { $regex: query, $options: "i" } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    status: "success",
    count: results.length,
    results,
  });
});

// Get Chat Statistics
export const getChatStats = catchAsync(async (req, res, next) => {
  const totalConversations = await Chat.distinct("conversationID", {
    user: req.user.id,
  }).then((arr) => arr.length);

  const totalMessages = await Chat.countDocuments({ user: req.user.id });

  const userMessages = await Chat.countDocuments({
    user: req.user.id,
    role: "user",
  });

  const assistantMessages = await Chat.countDocuments({
    user: req.user.id,
    role: "assistant",
  });

  res.status(200).json({
    status: "success",
    stats: {
      totalConversations,
      totalMessages,
      userMessages,
      assistantMessages,
      averageMessagesPerConversation: totalConversations
        ? Math.round(totalMessages / totalConversations)
        : 0,
    },
  });
});
