import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Notification from "../models/Notification.js";
import { AppError } from "../middleware/globalErrorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

// Helper to normalize user role
const getNormalizedRole = (user) => {
  if (!user) return "worker";
  if (user.role === "superadmin") return "state_admin";
  if (user.role === "employee") return "worker";
  return user.role;
};

// 1. Create or Process Wage Payment
export const createWagePayment = catchAsync(async (req, res, next) => {
  const { workerId, attendanceId, amount, dailyWage, workingDays, remarks } = req.body;

  if (!workerId) {
    return next(new AppError("Worker ID is required", 400));
  }

  const worker = await User.findById(workerId);
  if (!worker) {
    return next(new AppError("Worker not found", 404));
  }

  const wageAmount = amount || (dailyWage || worker.dailyWage || 425) * (workingDays || 1);
  const txnId = "TXN-DBT-" + Math.floor(100000000 + Math.random() * 900000000);

  // Determine Field Admin & Assistant Admin
  let fieldAdminId = req.user.id;
  let assistantAdminId = null;

  if (req.user) {
    const creator = await User.findById(req.user.id);
    if (creator?.parentId) assistantAdminId = creator.parentId;
  }

  const payment = await Payment.create({
    workerId: worker._id,
    employee: worker._id,
    employeeID: worker.employeeID || "WRK-001",
    workerName: worker.name || `${worker.firstName} ${worker.lastName}`,
    workerPhone: worker.phone,
    fieldAdminId,
    assistantAdminId,
    attendanceId: attendanceId || null,
    amount: wageAmount,
    totalAmount: wageAmount,
    dailyWage: dailyWage || worker.dailyWage || 425,
    workingDays: workingDays || 1,
    paymentStatus: "pending",
    status: "pending",
    paymentMethod: "Direct Benefit Transfer (DBT)",
    bankName: worker.bankName || "State Bank of India",
    accountNumber: worker.accountNumber || "389201948291",
    ifscCode: worker.ifscCode || "SBIN0001234",
    transactionId: txnId,
    transactionID: txnId,
    remarks: remarks || "Rural Employment Hub Wage Disbursement",
    approvedBy: req.user.id,
    approvedAt: new Date(),
  });

  // If attendance ID provided, update attendance payment status
  if (attendanceId) {
    await Attendance.findByIdAndUpdate(attendanceId, {
      paymentStatus: "approved",
    });
  }

  res.status(201).json({
    status: "success",
    message: "Wage payment record created successfully",
    payment,
  });
});

// 2. Update Payment Status & Trigger Automatic SMS if Credited
export const updatePaymentStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { paymentStatus, remarks } = req.body;

  const payment = await Payment.findById(id).populate("workerId");
  if (!payment) {
    return next(new AppError("Payment record not found", 404));
  }

  payment.paymentStatus = paymentStatus || payment.paymentStatus;
  payment.status = paymentStatus || payment.status;
  if (remarks) payment.remarks = remarks;

  if (paymentStatus === "credited") {
    payment.creditedDate = new Date();
    payment.paidDate = new Date();
    payment.smsSent = true;
    payment.smsSentAt = new Date();

    const workerName = payment.workerName || payment.workerId?.name || "Worker";
    const amount = payment.amount || payment.totalAmount || 850;
    const smsText = `Dear ${workerName}, your Rural Employment wage of ₹${amount} has been credited successfully to your bank account (${payment.bankName || "SBI"} - A/C ending in ${payment.accountNumber ? payment.accountNumber.slice(-4) : "8291"}). Txn ID: ${payment.transactionId}.`;

    payment.smsMessage = smsText;

    // Log SMS in Notification collection
    await Notification.create({
      title: "Wage Credited to Bank Account",
      message: smsText,
      type: "wage_credit",
      recipient: payment.workerId?._id || payment.workerId,
      recipientPhone: payment.workerPhone || payment.workerId?.phone,
      recipientName: workerName,
      sender: req.user.id,
      channels: {
        email: false,
        sms: true,
        whatsapp: false,
        inApp: true,
      },
      status: {
        delivered: true,
        deliveredAt: new Date(),
        read: false,
      },
      relatedData: {
        referenceType: "payment",
        referenceID: payment._id,
        amount,
        transactionId: payment.transactionId,
      },
      priority: "high",
    });

    console.log(`\n📨 [SMS DISPATCHED] To: ${payment.workerPhone || payment.workerId?.phone}\n"${smsText}"\n`);
  }

  await payment.save();

  // Also sync attendance record if linked
  if (payment.attendanceId) {
    await Attendance.findByIdAndUpdate(payment.attendanceId, {
      paymentStatus: paymentStatus === "credited" ? "credited" : "approved",
    });
  }

  res.status(200).json({
    status: "success",
    message: `Payment marked as ${payment.paymentStatus}${payment.smsSent ? " and SMS notification dispatched" : ""}`,
    payment,
  });
});

// 3. Trigger / Resend Payment SMS Notification
export const triggerPaymentSMS = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const payment = await Payment.findById(id).populate("workerId");
  if (!payment) {
    return next(new AppError("Payment record not found", 404));
  }

  const workerName = payment.workerName || payment.workerId?.name || "Worker";
  const amount = payment.amount || payment.totalAmount || 850;
  const smsText = `Dear ${workerName}, your Rural Employment wage of ₹${amount} has been credited successfully to your bank account.`;

  payment.smsSent = true;
  payment.smsSentAt = new Date();
  payment.smsMessage = smsText;
  await payment.save();

  // Create notification
  const notif = await Notification.create({
    title: "Wage Credit SMS Alert",
    message: smsText,
    type: "wage_credit",
    recipient: payment.workerId?._id || payment.workerId,
    recipientPhone: payment.workerPhone || payment.workerId?.phone,
    recipientName: workerName,
    sender: req.user.id,
    channels: {
      email: false,
      sms: true,
      whatsapp: false,
      inApp: true,
    },
    status: {
      delivered: true,
      deliveredAt: new Date(),
      read: false,
    },
    relatedData: {
      referenceType: "payment",
      referenceID: payment._id,
      amount,
      transactionId: payment.transactionId,
    },
  });

  console.log(`\n📨 [SMS TRIGGERED MANUALLY] To: ${payment.workerPhone || payment.workerId?.phone}\n"${smsText}"\n`);

  res.status(200).json({
    status: "success",
    message: `SMS notification dispatched successfully to ${payment.workerPhone || "worker"}`,
    notification: notif,
    smsMessage: smsText,
  });
});

// 4. Get Scoped Payments (Filtered by Role Hierarchy)
export const getScopedPayments = catchAsync(async (req, res, next) => {
  const userRole = getNormalizedRole(req.user);
  const { paymentStatus, workerId, village } = req.query;

  let filter = {};

  if (userRole === "worker") {
    // Worker only views their own payments
    filter.$or = [{ workerId: req.user.id }, { employee: req.user.id }];
  } else if (userRole === "field_admin" || req.user.role === "admin") {
    // Field Admin only views payments for their workers
    const myWorkers = await User.find({
      $or: [{ parentId: req.user.id }, { assignedAdmin: req.user.id }],
    });
    const workerIds = myWorkers.map((w) => w._id);
    filter.$or = [
      { fieldAdminId: req.user.id },
      { workerId: { $in: workerIds } },
      { employee: { $in: workerIds } },
    ];
  } else if (userRole === "assistant_admin") {
    // Assistant Admin views payments for all Field Admins under them
    const myFieldAdmins = await User.find({ parentId: req.user.id, role: { $in: ["field_admin", "admin"] } });
    const faIds = myFieldAdmins.map((fa) => fa._id);
    const myWorkers = await User.find({
      $or: [{ parentId: { $in: faIds } }, { assignedAdmin: { $in: faIds } }],
    });
    const workerIds = myWorkers.map((w) => w._id);
    filter.$or = [
      { assistantAdminId: req.user.id },
      { fieldAdminId: { $in: faIds } },
      { workerId: { $in: workerIds } },
      { employee: { $in: workerIds } },
    ];
  }
  // State Admin views all payments

  if (paymentStatus && paymentStatus !== "all") {
    filter.$or = [{ paymentStatus }, { status: paymentStatus }];
  }
  if (workerId) {
    filter.workerId = workerId;
  }

  const payments = await Payment.find(filter)
    .populate("workerId", "name firstName lastName phone employeeID jobCardNumber village mandal district bankName accountNumber ifscCode")
    .populate("employee", "name firstName lastName phone employeeID jobCardNumber village mandal district bankName accountNumber ifscCode")
    .populate("fieldAdminId", "name firstName lastName adminCode adminTitle")
    .sort({ createdAt: -1 })
    .limit(300);

  res.status(200).json({
    status: "success",
    count: payments.length,
    payments,
  });
});

// 5. Get Worker Personal Payments (Worker Dashboard)
export const getWorkerPayments = catchAsync(async (req, res, next) => {
  const targetId = req.params.workerId || req.user.id;

  const payments = await Payment.find({
    $or: [{ workerId: targetId }, { employee: targetId }],
  }).sort({ createdAt: -1 });

  const totalCredited = payments
    .filter((p) => p.paymentStatus === "credited" || p.status === "paid" || p.status === "credited")
    .reduce((sum, p) => sum + (p.amount || p.totalAmount || 0), 0);

  const pendingAmount = payments
    .filter((p) => p.paymentStatus === "pending" || p.status === "pending")
    .reduce((sum, p) => sum + (p.amount || p.totalAmount || 0), 0);

  res.status(200).json({
    status: "success",
    summary: {
      totalCredited,
      pendingAmount,
      totalTransactions: payments.length,
    },
    payments,
  });
});

// Backward compatibility exports
export const createPayment = createWagePayment;
export const getAllPayments = getScopedPayments;
export const getEmployeePayments = getWorkerPayments;
export const updatePayment = updatePaymentStatus;
export const deletePayment = catchAsync(async (req, res, next) => {
  await Payment.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: "success", message: "Payment deleted" });
});
export const getPaymentStats = catchAsync(async (req, res, next) => {
  const payments = await Payment.find();
  const totalCredited = payments
    .filter((p) => p.paymentStatus === "credited" || p.status === "paid")
    .reduce((sum, p) => sum + (p.amount || p.totalAmount || 0), 0);
  const totalPending = payments
    .filter((p) => p.paymentStatus === "pending" || p.status === "pending")
    .reduce((sum, p) => sum + (p.amount || p.totalAmount || 0), 0);
  res.status(200).json({
    status: "success",
    stats: { totalCredited, totalPending, count: payments.length },
  });
});
