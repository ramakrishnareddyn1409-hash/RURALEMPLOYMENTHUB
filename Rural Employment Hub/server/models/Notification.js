import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide notification title"],
    },
    message: {
      type: String,
      required: [true, "Please provide notification message"],
    },
    type: {
      type: String,
      enum: [
        "attendance",
        "payment",
        "sms",
        "wage_credit",
        "work-assignment",
        "emergency",
        "general",
        "reminder",
      ],
      default: "general",
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientPhone: String,
    recipientName: String,
    recipientType: {
      type: String,
      enum: ["individual", "department", "all"],
      default: "individual",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    channels: {
      email: {
        type: Boolean,
        default: false,
      },
      sms: {
        type: Boolean,
        default: true,
      },
      whatsapp: {
        type: Boolean,
        default: false,
      },
      inApp: {
        type: Boolean,
        default: true,
      },
    },
    status: {
      read: {
        type: Boolean,
        default: false,
      },
      readAt: Date,
      delivered: {
        type: Boolean,
        default: true,
      },
      deliveredAt: {
        type: Date,
        default: Date.now,
      },
    },
    relatedData: {
      referenceType: String, // "attendance", "payment", "assignment", etc.
      referenceID: mongoose.Schema.Types.ObjectId,
      amount: Number,
      transactionId: String,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "high",
    },
    expiresAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ "status.read": 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);
