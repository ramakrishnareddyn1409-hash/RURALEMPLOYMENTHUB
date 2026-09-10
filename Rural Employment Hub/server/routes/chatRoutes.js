import express from "express";
import {
  sendChatMessage,
  getConversation,
  getAllConversations,
  renameConversation,
  deleteConversation,
  clearAllConversations,
  searchConversations,
  getChatStats,
} from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";
import { checkValidation } from "../middleware/validation.js";
import { sendChatMessageValidation } from "../validators/validations.js";

const router = express.Router();

// Send Message
router.post("/message", protect, sendChatMessageValidation, checkValidation, sendChatMessage);

// Get Conversation
router.get("/conversation/:conversationID", protect, getConversation);

// Get All Conversations
router.get("/conversations/list", protect, getAllConversations);

// Rename Conversation
router.put("/conversation/:conversationID/rename", protect, renameConversation);

// Delete Conversation
router.delete("/conversation/:conversationID", protect, deleteConversation);

// Clear All Conversations
router.delete("/conversations/clear-all", protect, clearAllConversations);

// Search Conversations
router.get("/conversations/search", protect, searchConversations);

// Chat Statistics
router.get("/stats/summary", protect, getChatStats);

export default router;
