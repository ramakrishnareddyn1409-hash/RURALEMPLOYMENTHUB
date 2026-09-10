import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { AppError } from "../middleware/globalErrorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

// Send Notification
export const sendNotification = catchAsync(async (req, res, next) => {
  const {
    title,
    message,
    type,
    recipientID,
    recipientType,
    channels,
    priority,
    relatedData,
  } = req.body;

  // Determine recipients
  let recipients = [];

  if (recipientType === "individual") {
    recipients = [recipientID];
  } else if (recipientType === "department") {
    // Find employees by department
    const employees = await User.find({ role: "employee" });
    recipients = employees.map((e) => e._id);
  } else if (recipientType === "all") {
    // Send to all users
    const users = await User.find();
    recipients = users.map((u) => u._id);
  }

  // Create notifications for each recipient
  const notifications = await Notification.insertMany(
    recipients.map((recipientID) => ({
      title,
      message,
      type,
      recipient: recipientID,
      recipientType,
      sender: req.user.id,
      channels: channels || { inApp: true },
      priority: priority || "medium",
      relatedData,
    }))
  );

  res.status(201).json({
    status: "success",
    message: "Notifications sent successfully",
    count: notifications.length,
  });
});

// Get User Notifications
export const getUserNotifications = catchAsync(async (req, res, next) => {
  const { read } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let filter = { recipient: req.user.id };

  if (read === "true") {
    filter["status.read"] = true;
  } else if (read === "false") {
    filter["status.read"] = false;
  }

  const notifications = await Notification.find(filter)
    .populate("sender", "firstName lastName")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Notification.countDocuments(filter);

  // Count unread
  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    "status.read": false,
  });

  res.status(200).json({
    status: "success",
    total,
    unreadCount,
    page,
    pages: Math.ceil(total / limit),
    notifications,
  });
});

// Mark Notification as Read
export const markNotificationAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  if (notification.recipient.toString() !== req.user.id) {
    return next(new AppError("Not authorized to update this notification", 403));
  }

  notification.status.read = true;
  notification.status.readAt = new Date();

  await notification.save();

  res.status(200).json({
    status: "success",
    message: "Notification marked as read",
  });
});

// Mark All Notifications as Read
export const markAllNotificationsAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user.id, "status.read": false },
    {
      $set: {
        "status.read": true,
        "status.readAt": new Date(),
      },
    }
  );

  res.status(200).json({
    status: "success",
    message: "All notifications marked as read",
  });
});

// Delete Notification
export const deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  if (notification.recipient.toString() !== req.user.id) {
    return next(new AppError("Not authorized to delete this notification", 403));
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Notification deleted successfully",
  });
});

// Get Notification Stats
export const getNotificationStats = catchAsync(async (req, res, next) => {
  const total = await Notification.countDocuments({ recipient: req.user.id });

  const unread = await Notification.countDocuments({
    recipient: req.user.id,
    "status.read": false,
  });

  const byType = await Notification.aggregate([
    { $match: { recipient: req.user.id } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    stats: {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    },
  });
});

// Broadcast Notification (Admin Only)
export const broadcastNotification = catchAsync(async (req, res, next) => {
  const { title, message, type, priority } = req.body;

  // Get all employees
  const employees = await User.find({ role: "employee" });

  const notifications = await Notification.insertMany(
    employees.map((emp) => ({
      title,
      message,
      type,
      recipient: emp._id,
      sender: req.user.id,
      recipientType: "all",
      priority: priority || "high",
      channels: { inApp: true, email: true },
    }))
  );

  res.status(201).json({
    status: "success",
    message: "Broadcast notification sent successfully",
    count: notifications.length,
  });
});
