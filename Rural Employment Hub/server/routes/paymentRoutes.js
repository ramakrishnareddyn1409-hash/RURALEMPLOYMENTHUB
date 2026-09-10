import express from "express";
import {
  createWagePayment,
  updatePaymentStatus,
  triggerPaymentSMS,
  getScopedPayments,
  getWorkerPayments,
  createPayment,
  getAllPayments,
  deletePayment,
} from "../controllers/paymentController.js";
import { protect, fieldAdminOrAbove } from "../middleware/auth.js";

const router = express.Router();

// Wage Generation & Processing
router.post("/wage", protect, createWagePayment);
router.post("/", protect, createWagePayment);

// Payment Status Update (Approvals & Direct Benefit Transfer Credit)
router.put("/:id/status", protect, updatePaymentStatus);
router.put("/:id", protect, updatePaymentStatus);

// SMS Notification Dispatch (Field Admin / System trigger)
router.post("/:id/send-sms", protect, triggerPaymentSMS);

// Scoped Payments Query (State Admin -> All, Assistant Admin -> Subtree, Field Admin -> Assigned Workers, Worker -> Self)
router.get("/scoped", protect, getScopedPayments);
router.get("/", protect, getScopedPayments);

// Worker Personal Payments
router.get("/worker", protect, getWorkerPayments);
router.get("/worker/:workerId", protect, getWorkerPayments);
router.get("/employee/list", protect, getWorkerPayments);

router.delete("/:id", protect, deletePayment);

export default router;
