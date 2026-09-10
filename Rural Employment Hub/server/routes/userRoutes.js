import express from "express";
import {
  createAssistantAdmin,
  getAssistantAdmins,
  updateAssistantAdmin,
  deleteAssistantAdmin,
  toggleUserStatus,
  createFieldAdmin,
  getFieldAdmins,
  updateFieldAdmin,
  deleteFieldAdmin,
  registerWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
  approveWorker,
  rejectWorker,
  getAllEmployees,
  getEmployeeById,
  getAdminsList,
} from "../controllers/userController.js";
import {
  protect,
  authorize,
  stateAdminOnly,
  assistantAdminOrAbove,
  fieldAdminOrAbove,
} from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// 1. STATE ADMIN -> ASSISTANT ADMIN ROUTES
// ==========================================
router.post("/assistant-admins", protect, createAssistantAdmin);
router.get("/assistant-admins", protect, getAssistantAdmins);
router.put("/assistant-admins/:id", protect, updateAssistantAdmin);
router.delete("/assistant-admins/:id", protect, deleteAssistantAdmin);
router.put("/toggle-status/:id", protect, toggleUserStatus);

// ==========================================
// 2. ASSISTANT ADMIN -> FIELD ADMIN ROUTES
// ==========================================
router.post("/field-admins", protect, createFieldAdmin);
router.get("/field-admins", protect, getFieldAdmins);
router.put("/field-admins/:id", protect, updateFieldAdmin);
router.delete("/field-admins/:id", protect, deleteFieldAdmin);

// ==========================================
// 3. FIELD ADMIN -> WORKER ROUTES & APPROVALS
// ==========================================
router.post("/workers", protect, registerWorker);
router.get("/workers", protect, getWorkers);
router.put("/workers/:id", protect, updateWorker);
router.delete("/workers/:id", protect, deleteWorker);
router.put("/workers/:id/approve", protect, approveWorker);
router.put("/workers/:id/reject", protect, rejectWorker);

// ==========================================
// 4. LEGACY & HELPER ROUTES
// ==========================================
router.get("/admins/list", protect, getAdminsList);
router.get("/all", protect, getAllEmployees);
router.get("/:id", protect, getEmployeeById);

export default router;
