import express from "express";
import {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  broadcastNotification,
} from "../controllers/notificationController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { checkValidation } from "../middleware/validation.js";
import {
  createNotificationValidation,
  mongoIdValidation,
  paginationValidation,
} from "../validators/validations.js";

const router = express.Router();

// Send Notification (Admin)
router.post("/send", protect, adminOnly, createNotificationValidation, checkValidation, sendNotification);

// Get User Notifications
router.get("/", protect, paginationValidation, checkValidation, getUserNotifications);

// Get Notification Stats
router.get("/stats/summary", protect, getNotificationStats);

// Mark as Read
router.put("/:id/read", protect, mongoIdValidation, checkValidation, markNotificationAsRead);

// Mark All as Read
router.put("/read-all", protect, markAllNotificationsAsRead);

// Delete Notification
router.delete("/:id", protect, mongoIdValidation, checkValidation, deleteNotification);

// Broadcast Notification (Admin)
router.post(
  "/broadcast/all",
  protect,
  adminOnly,
  createNotificationValidation,
  checkValidation,
  broadcastNotification
);

export default router;
