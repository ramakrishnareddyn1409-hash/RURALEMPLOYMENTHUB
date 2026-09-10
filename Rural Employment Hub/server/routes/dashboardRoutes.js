import express from "express";
import {
  getStateAdminDashboard,
  getAssistantAdminDashboard,
  getFieldAdminDashboard,
  getWorkerDashboard,
  getAdminDashboardStats,
  getEmployeeDashboardStats,
} from "../controllers/dashboardController.js";
import {
  protect,
  stateAdminOnly,
  assistantAdminOrAbove,
  fieldAdminOrAbove,
  employeeOnly,
} from "../middleware/auth.js";

const router = express.Router();

// Role-specific Dashboards - accessible to all authenticated users for seamless overview
router.get("/state-admin", protect, stateAdminOnly, getStateAdminDashboard);
router.get("/assistant-admin", protect, assistantAdminOrAbove, getAssistantAdminDashboard);
router.get("/field-admin", protect, fieldAdminOrAbove, getFieldAdminDashboard);
router.get("/worker", protect, employeeOnly, getWorkerDashboard);

// Compatibility Routes
router.get("/admin/stats", protect, stateAdminOnly, getStateAdminDashboard);
router.get("/superadmin/stats", protect, stateAdminOnly, getStateAdminDashboard);
router.get("/employee/stats", protect, employeeOnly, getWorkerDashboard);

export default router;
