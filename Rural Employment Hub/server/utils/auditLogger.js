import AuditLog from "../models/AuditLog.js";

/**
 * Log an administrative action to MongoDB
 */
export const logAdminAction = async ({
  req,
  action,
  targetType,
  targetId = null,
  targetDetails = "",
  status = "SUCCESS",
  metadata = {},
}) => {
  try {
    const performedBy = req.user ? req.user._id || req.user.id : null;
    const performedByName = req.user ? req.user.name || "System Admin" : "System";
    const role = req.user ? req.user.role : "system";
    const ipAddress = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";

    if (performedBy) {
      await AuditLog.create({
        performedBy,
        performedByName,
        role,
        action,
        targetType,
        targetId: targetId ? targetId.toString() : null,
        targetDetails,
        ipAddress: typeof ipAddress === "string" ? ipAddress : "127.0.0.1",
        status,
        metadata,
      });
    }
  } catch (error) {
    console.error("Audit log error (non-fatal):", error.message);
  }
};
