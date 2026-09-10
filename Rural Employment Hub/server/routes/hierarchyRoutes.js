import express from "express";
import {
  getDistricts,
  getMandals,
  getVillages,
  createDistrict,
  createMandal,
  createVillage,
  getAuditLogs,
} from "../controllers/hierarchyController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public / Semi-protected routes for drop-downs
router.get("/districts", getDistricts);
router.get("/mandals", getMandals);
router.get("/villages", getVillages);

// Protected administrative creation routes
router.post("/districts", protect, createDistrict);
router.post("/mandals", protect, createMandal);
router.post("/villages", protect, createVillage);

// Audit logs
router.get("/audit-logs", protect, getAuditLogs);

export default router;
