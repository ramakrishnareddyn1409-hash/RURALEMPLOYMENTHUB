import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationID: {
      type: String,
      required: true,
    },
    conversationTitle: {
      type: String,
      default: "New Conversation",
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    message: {
      type: String,
      required: [true, "Please provide message"],
    },
    messageType: {
      type: String,
      enum: ["text", "code", "image"],
      default: "text",
    },
    // For AI responses
    aiModel: {
      type: String,
      default: "llama-3.1-8b-instant",
    },
    responseTime: Number, // in milliseconds
    tokens: {
      prompt: Number,
      completion: Number,
      total: Number,
    },
    // Message metadata
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    isFlagged: {
      type: Boolean,
      default: false,
    },
    feedback: {
      rating: Number, // 1-5
      comment: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
ChatSchema.index({ user: 1, conversationID: 1, createdAt: -1 });
ChatSchema.index({ conversationID: 1 });
ChatSchema.index({ user: 1 });

export default mongoose.model("Chat", ChatSchema);
