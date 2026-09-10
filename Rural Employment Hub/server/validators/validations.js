import { body, param, query } from "express-validator";

// ============ AUTH VALIDATIONS ============
export const registerValidation = [
  body("role")
    .exists({ checkFalsy: true })
    .withMessage("Please select a registration section")
    .isIn(["state_admin", "assistant_admin", "field_worker", "worker"])
    .withMessage("Invalid registration role"),
  body().custom((value, { req }) => {
    const { name, firstName, lastName } = req.body;
    if (!(name?.trim() || (firstName?.trim() && lastName?.trim()))) {
      throw new Error("Please provide your full name");
    }
    return true;
  }),
  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("phone").matches(/^[6-9]\d{9}$/).withMessage("Please provide a valid phone number"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidation = [
  body().custom((value, { req }) => {
    const identifier = req.body.email || req.body.username || req.body.phone;
    if (!identifier?.trim()) {
      throw new Error("Email or phone number is required");
    }
    return true;
  }),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

// ============ USER VALIDATIONS ============
export const updateProfileValidation = [
  body("firstName").optional().trim(),
  body("lastName").optional().trim(),
  body("phone").optional().matches(/^[6-9]\d{9}$/),
  body("village").optional().trim(),
  body("district").optional().trim(),
  body("mandal").optional().trim(),
  body("panchayat").optional().trim(),
];

export const updateBankDetailsValidation = [
  body("bankName").trim().notEmpty().withMessage("Bank name is required"),
  body("accountNumber").trim().notEmpty().withMessage("Account number is required"),
  body("accountHolderName").trim().notEmpty().withMessage("Account holder name is required"),
  body("ifscCode").trim().notEmpty().withMessage("IFSC code is required"),
];

// ============ ATTENDANCE VALIDATIONS ============
export const markAttendanceValidation = [
  body("employeeID").optional().trim(),
  body("date").isISO8601().withMessage("Invalid date format"),
  body("status")
    .isIn(["present", "absent", "half-day", "leave"])
    .withMessage("Invalid attendance status"),
];

export const getAttendanceValidation = [
  query("startDate").optional().isISO8601().withMessage("Invalid start date"),
  query("endDate").optional().isISO8601().withMessage("Invalid end date"),
  query("status").optional().isIn(["present", "absent", "half-day", "leave"]),
];

// ============ PAYMENT VALIDATIONS ============
export const createPaymentValidation = [
  body("employeeID").trim().notEmpty().withMessage("Employee ID is required"),
  body("dailyWage").isFloat({ min: 0 }).withMessage("Daily wage must be a positive number"),
  body("workingDays").isInt({ min: 0 }).withMessage("Working days must be a positive number"),
  body("bonus").optional().isFloat({ min: 0 }),
  body("deductions").optional().isFloat({ min: 0 }),
];

export const updatePaymentStatusValidation = [
  param("id").isMongoId().withMessage("Invalid payment ID"),
  body("status")
    .isIn(["pending", "approved", "paid", "rejected"])
    .withMessage("Invalid payment status"),
];

// ============ ASSIGNMENT VALIDATIONS ============
export const createAssignmentValidation = [
  body("title").trim().notEmpty().withMessage("Assignment title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("workCategory")
    .isIn([
      "road-construction",
      "water-management",
      "agriculture",
      "rural-development",
      "sanitation",
      "other",
    ])
    .withMessage("Invalid work category"),
  body("startDate").isISO8601().withMessage("Invalid start date"),
  body("endDate").isISO8601().withMessage("Invalid end date"),
  body("dailyWage").isFloat({ min: 0 }).withMessage("Daily wage must be positive"),
  body("estimatedWorkers").isInt({ min: 1 }).withMessage("Must have at least 1 worker"),
];

// ============ NOTIFICATION VALIDATIONS ============
export const createNotificationValidation = [
  body("title").trim().notEmpty().withMessage("Notification title is required"),
  body("message").trim().notEmpty().withMessage("Notification message is required"),
  body("type")
    .isIn(["attendance", "payment", "work-assignment", "emergency", "general", "reminder"])
    .withMessage("Invalid notification type"),
];

// ============ CHAT VALIDATIONS ============
export const sendChatMessageValidation = [
  body("message").trim().notEmpty().withMessage("Message cannot be empty"),
  body("conversationID").optional().trim(),
];

// ============ COMMON VALIDATIONS ============
export const mongoIdValidation = [param("id").isMongoId().withMessage("Invalid ID format")];

export const paginationValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive number"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];
