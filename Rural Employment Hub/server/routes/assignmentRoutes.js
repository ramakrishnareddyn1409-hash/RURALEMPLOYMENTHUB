import express from "express";
import {
  createAssignment,
  getAllAssignments,
  getEmployeeAssignments,
  getAssignment,
  assignEmployeesToAssignment,
  updateAssignmentStatus,
  respondToAssignment,
  getActiveAssignments,
} from "../controllers/assignmentController.js";
import { body, param } from "express-validator";
import { protect, adminOnly } from "../middleware/auth.js";
import { checkValidation } from "../middleware/validation.js";
import {
  createAssignmentValidation,
  mongoIdValidation,
  paginationValidation,
} from "../validators/validations.js";

const router = express.Router();

// Create Assignment (Admin)
router.post("/", protect, adminOnly, createAssignmentValidation, checkValidation, createAssignment);

// Get All Assignments
router.get("/", protect, paginationValidation, checkValidation, getAllAssignments);

// Get Employee's Assignments
router.get("/employee/my-assignments", protect, getEmployeeAssignments);

// Get Single Assignment
router.get("/:id", protect, mongoIdValidation, checkValidation, getAssignment);

// Assign Employees (Admin)
router.post(
  "/:id/assign-employees",
  protect,
  adminOnly,
  mongoIdValidation,
  checkValidation,
  assignEmployeesToAssignment
);

// Update Assignment Status (Admin)
router.put(
  "/:id/status",
  protect,
  adminOnly,
  mongoIdValidation,
  checkValidation,
  updateAssignmentStatus
);

// Employee Response to Assignment
const respondValidation = [
  param("assignmentID").isMongoId().withMessage("Invalid assignment ID format"),
  body("response").isIn(["accepted", "rejected"]).withMessage("Response must be 'accepted' or 'rejected'"),
];
router.post(
  "/:assignmentID/respond",
  protect,
  respondValidation,
  checkValidation,
  respondToAssignment
);

// Get Active Assignments
router.get("/active/list", protect, getActiveAssignments);

export default router;
