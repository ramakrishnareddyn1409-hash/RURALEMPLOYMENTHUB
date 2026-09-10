import express from "express";
import {
  markFaceAttendance,
  enrollWorkerFace,
  markFingerprintAttendance,
  bulkMarkFingerprintAttendance,
  getScopedAttendance,
  getWorkerAttendanceStats,
  markAttendance,
  getDailyAttendance,
} from "../controllers/attendanceController.js";
import { protect, fieldAdminOrAbove } from "../middleware/auth.js";

const router = express.Router();

// AI Face Recognition Attendance
router.post("/face-mark", protect, fieldAdminOrAbove, markFaceAttendance);
router.post(
  "/self-face-mark",
  protect,
  fieldAdminOrAbove,
  (req, res, next) => {
    req.selfOnly = true;
    markFaceAttendance(req, res, next);
  }
);
router.post("/enroll-face", protect, enrollWorkerFace);

// Fingerprint Attendance
router.post("/fingerprint-mark", protect, markFingerprintAttendance);
router.post("/bulk-fingerprint", protect, bulkMarkFingerprintAttendance);

// Role-Scoped Attendance Fetching
router.get("/scoped", protect, getScopedAttendance);
router.get("/worker-stats", protect, getWorkerAttendanceStats);
router.get("/worker-stats/:workerId", protect, getWorkerAttendanceStats);

// Compatibility Routes
router.post("/mark", protect, markAttendance);
router.get("/daily", protect, getDailyAttendance);
router.get("/employee", protect, getWorkerAttendanceStats);
router.get("/monthly-report", protect, getScopedAttendance);

export default router;
