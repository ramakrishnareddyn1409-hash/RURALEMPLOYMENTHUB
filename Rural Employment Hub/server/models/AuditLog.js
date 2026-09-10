import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    performedByName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    action: {
      type: String, // e.g. 'CREATE_ASSISTANT_ADMIN', 'UPDATE_WORKER', 'RELEASE_PAYMENT', 'TOGGLE_STATUS', 'MARK_ATTENDANCE'
      required: true,
    },
    targetType: {
      type: String, // 'User', 'Attendance', 'Payment', 'Village'
      required: true,
    },
    targetId: {
      type: String,
      default: null,
    },
    targetDetails: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", AuditLogSchema);
