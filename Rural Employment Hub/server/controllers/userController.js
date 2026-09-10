import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Payment from "../models/Payment.js";
import { AppError } from "../middleware/globalErrorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";
import { maskAadhaar, generateEmployeeID } from "../utils/helpers.js";
import mongoose from "mongoose";

// Helper to normalize user role
const getNormalizedRole = (user) => {
  if (!user) return "worker";
  if (user.role === "superadmin") return "state_admin";
  if (user.role === "employee") return "worker";
  return user.role;
};

// ==========================================
// 1. STATE ADMIN -> ASSISTANT ADMIN MANAGEMENT
// ==========================================

// Create Assistant Admin (State Admin Only)
export const createAssistantAdmin = catchAsync(async (req, res, next) => {
  const { name, firstName, lastName, email, phone, password, state, district, mandal, assignedDistricts } = req.body;

  if (!email || !phone || !password) {
    return next(new AppError("Please provide name/email/phone and password", 400));
  }

  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
  if (existing) {
    return next(new AppError("Email or phone already registered", 400));
  }

  const adminName = name || `${firstName || ""} ${lastName || ""}`.trim() || "Assistant Admin";
  const nameParts = adminName.split(" ");

  const assistantAdmin = await User.create({
    name: adminName,
    firstName: firstName || nameParts[0],
    lastName: lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "."),
    email: email.toLowerCase(),
    phone,
    password,
    role: "assistant_admin",
    parentId: req.user.id,
    adminCode: "ASST_ADMIN_" + Math.floor(100 + Math.random() * 900),
    adminTitle: req.body.adminTitle || `Assistant Regional Commissioner - ${district || "Kurnool"}`,
    state: state || "Andhra Pradesh",
    district: district || "Kurnool",
    mandal: mandal || "Dhone",
    assignedDistricts: assignedDistricts || [district || "Kurnool"],
    isVerified: true,
    isActive: true,
  });

  res.status(201).json({
    status: "success",
    message: "Assistant Admin created successfully",
    assistantAdmin: assistantAdmin.getPublicProfile(),
  });
});

// Get All Assistant Admins (State Admin view)
export const getAssistantAdmins = catchAsync(async (req, res, next) => {
  const assistantAdmins = await User.find({
    role: { $in: ["assistant_admin"] },
  })
    .select("-password")
    .sort({ createdAt: -1 });

  // Enrich with live counts of Field Admins and Workers under each Assistant Admin
  const enrichedList = await Promise.all(
    assistantAdmins.map(async (asst) => {
      const fieldAdmins = await User.find({ parentId: asst._id, role: { $in: ["field_admin", "admin"] } });
      const fieldAdminIds = fieldAdmins.map((fa) => fa._id);
      const workerCount = await User.countDocuments({
        $or: [
          { parentId: { $in: fieldAdminIds } },
          { assignedAdmin: { $in: fieldAdminIds } },
        ],
        role: { $in: ["worker", "employee"] },
      });

      return {
        ...asst.toObject(),
        fieldAdminCount: fieldAdmins.length,
        workerCount,
      };
    })
  );

  res.status(200).json({
    status: "success",
    count: enrichedList.length,
    assistantAdmins: enrichedList,
  });
});

// Update Assistant Admin
export const updateAssistantAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError("Invalid Assistant Admin ID", 400));
  }

  if (updateData.password) {
    delete updateData.password; // Do not overwrite password directly in basic update
  }

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    return next(new AppError("Assistant Admin not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Assistant Admin updated successfully",
    assistantAdmin: user,
  });
});

// Delete Assistant Admin
export const deleteAssistantAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError("Invalid Assistant Admin ID", 400));
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new AppError("Assistant Admin not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Assistant Admin deleted successfully",
  });
});

// Toggle User Active/Inactive status
export const toggleUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    status: "success",
    message: `User is now ${user.isActive ? "Active" : "Deactivated"}`,
    isActive: user.isActive,
  });
});

// ==========================================
// 2. ASSISTANT ADMIN -> FIELD ADMIN MANAGEMENT
// ==========================================

// Create Field Admin (Assistant Admin creates under themselves)
export const createFieldAdmin = catchAsync(async (req, res, next) => {
  const { name, firstName, lastName, email, phone, password, state, district, mandal, village, assignedVillages, adminTitle } = req.body;

  if (!email || !phone || !password) {
    return next(new AppError("Please provide name/email/phone and password", 400));
  }

  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
  if (existing) {
    return next(new AppError("Email or phone already registered", 400));
  }

  const fullName = name || `${firstName || ""} ${lastName || ""}`.trim() || "Field Admin";
  const nameParts = fullName.split(" ");

  const fieldAdmin = await User.create({
    name: fullName,
    firstName: firstName || nameParts[0],
    lastName: lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "."),
    email: email.toLowerCase(),
    phone,
    password,
    role: "field_admin",
    parentId: req.user.id, // Linked directly to the creating Assistant Admin
    adminCode: "FIELD_ADMIN_" + Math.floor(100 + Math.random() * 900),
    adminTitle: adminTitle || `Field Supervisor - ${mandal || "Dhone"} Zone`,
    state: state || "Andhra Pradesh",
    district: district || "Kurnool",
    mandal: mandal || "Dhone",
    village: village || "Kothapalli",
    assignedVillages: assignedVillages && assignedVillages.length > 0 ? assignedVillages : [village || "Kothapalli"],
    isVerified: true,
    isActive: true,
  });

  res.status(201).json({
    status: "success",
    message: "Field Admin created successfully",
    fieldAdmin: fieldAdmin.getPublicProfile(),
  });
});

// Get Field Admins (Scoped: State Admin sees all, Assistant Admin sees only their subtree)
export const getFieldAdmins = catchAsync(async (req, res, next) => {
  const userRole = getNormalizedRole(req.user);
  let filter = { role: { $in: ["field_admin", "admin"] } };

  if (userRole === "assistant_admin") {
    // Strict isolation: Assistant admin sees only their own Field Admins
    filter.parentId = req.user.id;
  }

  const fieldAdmins = await User.find(filter)
    .select("-password")
    .populate("parentId", "name firstName lastName email adminCode adminTitle")
    .sort({ createdAt: -1 });

  // Enrich with worker count
  const enrichedList = await Promise.all(
    fieldAdmins.map(async (fa) => {
      const workerCount = await User.countDocuments({
        $or: [{ parentId: fa._id }, { assignedAdmin: fa._id }],
        role: { $in: ["worker", "employee"] },
      });

      return {
        ...fa.toObject(),
        workerCount,
      };
    })
  );

  res.status(200).json({
    status: "success",
    count: enrichedList.length,
    fieldAdmins: enrichedList,
  });
});

// Update Field Admin
export const updateFieldAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userRole = getNormalizedRole(req.user);

  let target = await User.findById(id);
  if (!target) {
    return next(new AppError("Field Admin not found", 404));
  }

  // Security check: Assistant Admin can only update Field Admins under them
  if (userRole === "assistant_admin" && target.parentId?.toString() !== req.user.id) {
    return next(new AppError("Access denied: You can only manage your assigned Field Admins", 403));
  }

  const updateData = { ...req.body };
  delete updateData.password;

  const updated = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({
    status: "success",
    message: "Field Admin updated successfully",
    fieldAdmin: updated,
  });
});

// Delete Field Admin
export const deleteFieldAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userRole = getNormalizedRole(req.user);

  const target = await User.findById(id);
  if (!target) {
    return next(new AppError("Field Admin not found", 404));
  }

  if (userRole === "assistant_admin" && target.parentId?.toString() !== req.user.id) {
    return next(new AppError("Access denied: You can only delete your assigned Field Admins", 403));
  }

  await User.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    message: "Field Admin deleted successfully",
  });
});

// ==========================================
// 3. FIELD ADMIN -> WORKER MANAGEMENT
// ==========================================

// Register Worker (Field Admin registers under themselves)
export const registerWorker = catchAsync(async (req, res, next) => {
  const {
    name,
    firstName,
    lastName,
    email,
    phone,
    password,
    state,
    district,
    mandal,
    village,
    panchayat,
    aadhaar,
    jobCardNumber,
    dailyWage,
    bankName,
    accountNumber,
    ifscCode,
  } = req.body;

  if (!phone) {
    return next(new AppError("Please provide worker phone number", 400));
  }

  // Generate unique email if worker doesn't have an email
  const workerEmail = email ? email.toLowerCase() : `worker.${phone.replace(/[^0-9]/g, "").slice(-8)}@ruralhub.in`;

  const existing = await User.findOne({
    $or: [{ phone }, { email: workerEmail }],
  });

  if (existing) {
    return next(new AppError("Worker with this phone or email already registered", 400));
  }

  const fullName = name || `${firstName || ""} ${lastName || ""}`.trim() || "Worker";
  const nameParts = fullName.split(" ");
  const empID = generateEmployeeID();

  // Find creator details to inherit assistantAdmin if available
  const creator = await User.findById(req.user.id);

  const worker = await User.create({
    name: fullName,
    firstName: firstName || nameParts[0],
    lastName: lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "."),
    email: workerEmail,
    phone,
    password: password || "Worker@123", // Default secure temporary password
    role: "worker",
    parentId: req.user.id, // Linked to Field Admin
    assignedAdmin: req.user.id,
    employeeID: empID,
    state: state || creator?.state || "Andhra Pradesh",
    district: district || creator?.district || "Kurnool",
    mandal: mandal || creator?.mandal || "Dhone",
    village: village || creator?.village || "Kothapalli",
    panchayat: panchayat || creator?.panchayat || "Kothapalli Gram Panchayat",
    aadhaar: aadhaar || "8765-4321-9012",
    aadhaarMasked: aadhaar ? "XXXX-XXXX-" + aadhaar.slice(-4) : "XXXX-XXXX-9012",
    jobCardNumber: jobCardNumber || `AP-12-004-${Math.floor(1000 + Math.random() * 9000)}`,
    dailyWage: dailyWage ? Number(dailyWage) : 450,
    bankName: bankName || "State Bank of India",
    accountNumber: accountNumber || "389201948291",
    accountHolderName: fullName,
    ifscCode: ifscCode || "SBIN0001234",
    bankVerified: true,
    bankStatus: "verified",
    fingerprintEnrolled: true,
    faceEnrolled: true,
    isVerified: true,
    isActive: true,
  });

  res.status(201).json({
    status: "success",
    message: "Worker registered successfully",
    worker: worker.getPublicProfile(),
  });
});

// Get Scoped Workers
export const getWorkers = catchAsync(async (req, res, next) => {
  const userRole = getNormalizedRole(req.user);
  const { village, district, mandal, search, status, verificationStatus } = req.query;

  let filter = { role: { $in: ["worker", "employee"] } };

  if (userRole === "worker") {
    // Worker only views self
    filter._id = req.user.id;
  } else if (userRole === "field_admin" || req.user.role === "admin") {
    // Field Admin views assigned workers or pending applicants in their assigned mandal/village
    const myVillages = req.user.assignedVillages || [req.user.village || "Kothapalli"];
    filter.$or = [
      { parentId: req.user.id },
      { assignedAdmin: req.user.id },
      {
        verificationStatus: "pending_approval",
        $or: [
          { village: { $in: myVillages } },
          { mandal: new RegExp(`^${req.user.mandal || "Dhone"}$`, "i") },
        ],
      },
    ];
  } else if (userRole === "assistant_admin") {
    // Assistant Admin views all workers under their Field Admins
    const myFieldAdmins = await User.find({ parentId: req.user.id, role: { $in: ["field_admin", "admin"] } });
    const faIds = myFieldAdmins.map((fa) => fa._id);
    filter.$or = [
      { parentId: { $in: faIds } },
      { assignedAdmin: { $in: faIds } },
      { district: new RegExp(`^${req.user.district || "Kurnool"}$`, "i") },
    ];
  }
  // State Admin views all workers without restriction

  if (verificationStatus && verificationStatus !== "all") {
    filter.verificationStatus = verificationStatus;
  }

  if (village && village !== "all") {
    filter.village = { $regex: new RegExp(`^${village}$`, "i") };
  }
  if (district && district !== "all") {
    filter.district = { $regex: new RegExp(`^${district}$`, "i") };
  }
  if (mandal && mandal !== "all") {
    filter.mandal = { $regex: new RegExp(`^${mandal}$`, "i") };
  }
  if (status && status !== "all") {
    if (status === "pending" || status === "pending_approval") {
      filter.verificationStatus = "pending_approval";
    } else if (status === "active") {
      filter.isActive = true;
      filter.verificationStatus = { $ne: "pending_approval" };
    } else if (status === "inactive") {
      filter.isActive = false;
    }
  }
  if (search) {
    filter.$and = [
      ...(filter.$and || []),
      {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { employeeID: { $regex: search, $options: "i" } },
          { jobCardNumber: { $regex: search, $options: "i" } },
        ],
      },
    ];
  }

  const workers = await User.find(filter)
    .select("-password -faceDescriptors -faceImages")
    .populate("parentId", "name firstName lastName email adminCode adminTitle")
    .populate("assignedAdmin", "name firstName lastName email adminCode adminTitle")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    count: workers.length,
    workers,
    employees: workers, // Compatibility alias
  });
});

// Approve Worker Registration (Field Admin & Super Admin)
export const approveWorker = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { dailyWage, jobCardNumber } = req.body;

  const target = await User.findById(id);
  if (!target) {
    return next(new AppError("Worker registration not found", 404));
  }

  target.verificationStatus = "approved";
  target.isVerified = true;
  target.isActive = true;
  target.bankVerified = true;
  target.bankStatus = "verified";
  if (dailyWage) target.dailyWage = Number(dailyWage);
  if (jobCardNumber) target.jobCardNumber = jobCardNumber;
  if (!target.assignedAdmin) target.assignedAdmin = req.user.id;
  if (!target.parentId) target.parentId = req.user.id;

  await target.save();

  res.status(200).json({
    status: "success",
    message: "Worker account verified and approved successfully! Worker can now log in.",
    worker: target.getPublicProfile(),
  });
});

// Reject Worker Registration (Field Admin & Super Admin)
export const rejectWorker = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const target = await User.findById(id);
  if (!target) {
    return next(new AppError("Worker registration not found", 404));
  }

  target.verificationStatus = "rejected";
  target.isVerified = false;
  target.isActive = false;
  target.rejectionReason = reason || "Application details could not be verified by Field Admin.";

  await target.save();

  res.status(200).json({
    status: "success",
    message: "Worker registration has been rejected.",
    worker: target.getPublicProfile(),
  });
});

// Update Worker
export const updateWorker = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userRole = getNormalizedRole(req.user);

  const target = await User.findById(id);
  if (!target) {
    return next(new AppError("Worker not found", 404));
  }

  // Permission checks
  if (userRole === "field_admin" && target.parentId?.toString() !== req.user.id && target.assignedAdmin?.toString() !== req.user.id) {
    return next(new AppError("Access denied: You can only edit your assigned workers", 403));
  }

  const updateData = { ...req.body };
  delete updateData.password;

  if (updateData.name) {
    const parts = updateData.name.trim().split(" ");
    updateData.firstName = parts[0];
    updateData.lastName = parts.length > 1 ? parts.slice(1).join(" ") : ".";
  }

  const updated = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({
    status: "success",
    message: "Worker details updated successfully",
    worker: updated,
  });
});

// Delete Worker
export const deleteWorker = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userRole = getNormalizedRole(req.user);

  const target = await User.findById(id);
  if (!target) {
    return next(new AppError("Worker not found", 404));
  }

  if (userRole === "field_admin" && target.parentId?.toString() !== req.user.id && target.assignedAdmin?.toString() !== req.user.id) {
    return next(new AppError("Access denied: You can only delete your assigned workers", 403));
  }

  await User.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    message: "Worker deleted successfully",
  });
});

// ==========================================
// 4. BACKWARD COMPATIBILITY ENDPOINTS
// ==========================================
export const getAllEmployees = getWorkers;
export const getEmployeeById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return next(new AppError("User not found", 404));
  res.status(200).json({ status: "success", employee: user });
});
export const createEmployee = registerWorker;
export const updateEmployee = updateWorker;
export const deleteEmployee = deleteWorker;

export const getAdminsList = catchAsync(async (req, res, next) => {
  const admins = await User.find({ role: { $in: ["assistant_admin", "field_admin", "admin", "superadmin"] } })
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json({ status: "success", admins });
});
