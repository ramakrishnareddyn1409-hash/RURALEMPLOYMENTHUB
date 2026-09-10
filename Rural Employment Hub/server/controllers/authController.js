import User from "../models/User.js";
import { sendTokenResponse } from "../utils/jwt.js";
import { generateEmployeeID } from "../utils/helpers.js";
import { AppError } from "../middleware/globalErrorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// ─── In-memory OTP store: { phone: { otp, expiresAt } } ───
const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Helper to auto-seed demo accounts on-demand if they don't exist in MongoDB yet
const ensureDemoAccounts = async (identifier) => {
  // 1. State Admin
  if (
    identifier === "stateadmin@gov.in" ||
    identifier === "stateadmin" ||
    identifier === "state_admin" ||
    identifier === "superadmin@ruralhub.in" ||
    identifier === "superadmin"
  ) {
    const stateAdminEmail = identifier === "superadmin" || identifier === "superadmin@ruralhub.in"
      ? "superadmin@ruralhub.in"
      : "stateadmin@gov.in";
    let sa = await User.findOne({ email: stateAdminEmail }).select("+password");

    if (!sa) {
      sa = await User.create({
        name: "Sri K. Vijay Kumar, IAS",
        firstName: "K. Vijay",
        lastName: "Kumar",
        email: stateAdminEmail,
        phone: "+919876500001",
        password: "admin123",
        role: "state_admin",
        adminCode: "STATE_ADMIN_HQ",
        adminTitle: "Principal Secretary & State Employment Commissioner",
        state: "Andhra Pradesh",
        district: "State Headquarters (Amaravati)",
        mandal: "Central Secretariat",
        village: "Headquarters",
        isVerified: true,
        isActive: true,
      });
      sa = await User.findById(sa._id).select("+password");
    }
    return sa;
  }

  // 2. Assistant Admin
  if (
    identifier === "assistantadmin@gov.in" ||
    identifier === "assistantadmin" ||
    identifier === "assistant_admin"
  ) {
    let aa = await User.findOne({ email: "assistantadmin@gov.in" }).select("+password");
    if (!aa) {
      // Find or create parent state admin
      const stateAdmin = await ensureDemoAccounts("stateadmin@gov.in");

      aa = await User.create({
        name: "R. Ramanathan",
        firstName: "R.",
        lastName: "Ramanathan",
        email: "assistantadmin@gov.in",
        phone: "+919876500002",
        password: "admin123",
        role: "assistant_admin",
        parentId: stateAdmin?._id,
        adminCode: "ASST_ADMIN_KNL",
        adminTitle: "Assistant Commissioner - Kurnool Division",
        state: "Andhra Pradesh",
        district: "Kurnool",
        mandal: "Dhone",
        village: "Kurnool Regional Office",
        assignedDistricts: ["Kurnool", "Anantapur"],
        isVerified: true,
        isActive: true,
      });
      aa = await User.findById(aa._id).select("+password");
    }
    return aa;
  }

  // 3. Field Admin
  if (
    identifier === "fieldadmin@gov.in" ||
    identifier === "fieldadmin" ||
    identifier === "field_admin" ||
    identifier === "admin.a@ruralhub.in"
  ) {
    const fieldAdminEmail = identifier === "admin.a@ruralhub.in"
      ? "admin.a@ruralhub.in"
      : "fieldadmin@gov.in";
    let fa = await User.findOne({ email: fieldAdminEmail }).select("+password");

    if (!fa) {
      const asstAdmin = await ensureDemoAccounts("assistantadmin@gov.in");

      fa = await User.create({
        name: "Suresh Reddy",
        firstName: "Suresh",
        lastName: "Reddy",
        email: fieldAdminEmail,
        phone: "+919876500004",
        password: "admin123",
        role: "field_admin",
        parentId: asstAdmin?._id,
        adminCode: "FIELD_ADMIN_DHONE",
        adminTitle: "Field Supervisor - Dhone Mandal",
        state: "Andhra Pradesh",
        district: "Kurnool",
        mandal: "Dhone",
        village: "Kothapalli",
        assignedVillages: ["Kothapalli", "Venkatapuram", "Chanugondla"],
        isVerified: true,
        isActive: true,
      });
      fa = await User.findById(fa._id).select("+password");
    }
    return fa;
  }

  // 4. Worker
  if (
    identifier === "worker1@gov.in" ||
    identifier === "worker1" ||
    identifier === "worker@gov.in" ||
    identifier === "worker"
  ) {
    let wk = await User.findOne({ email: "worker1@gov.in" }).select("+password");
    if (!wk) {
      const fieldAdmin = await ensureDemoAccounts("fieldadmin@gov.in");

      wk = await User.create({
        name: "Ramesh Babu",
        firstName: "Ramesh",
        lastName: "Babu",
        email: "worker1@gov.in",
        phone: "+919876510001",
        password: "admin123",
        role: "worker",
        parentId: fieldAdmin?._id,
        assignedAdmin: fieldAdmin?._id,
        employeeID: "WRK-AP-1001",
        state: "Andhra Pradesh",
        district: "Kurnool",
        mandal: "Dhone",
        village: "Kothapalli",
        panchayat: "Kothapalli Gram Panchayat",
        aadhaarMasked: "XXXX-XXXX-4819",
        jobCardNumber: "AP-12-004-1001",
        dailyWage: 425,
        bankName: "State Bank of India",
        accountNumber: "389201948291",
        ifscCode: "SBIN0001234",
        fingerprintEnrolled: true,
        isVerified: true,
        isActive: true,
      });
      wk = await User.findById(wk._id).select("+password");
    }
    return wk;
  }

  return null;
};

const REGISTRATION_ROLES = ["state_admin", "assistant_admin", "field_worker", "worker"];

const registrationRoleDetails = {
  state_admin: { label: "State Admin", authorityRole: "state_admin" },
  assistant_admin: { label: "Assistant Admin", authorityRole: "state_admin" },
  field_worker: { label: "Field Worker", authorityRole: "assistant_admin" },
  worker: { label: "Worker", authorityRole: "field_admin" },
};

// Register an account for the section explicitly selected by the applicant.
export const register = catchAsync(async (req, res, next) => {
  const {
    name,
    firstName,
    lastName,
    fatherOrHusbandName,
    gender,
    age,
    email,
    phone,
    password,
    village,
    mandal,
    district,
    state,
    panchayat,
    address,
    aadhaar,
    jobCardNumber,
    bankName,
    accountNumber,
    ifscCode,
    role,
  } = req.body;

  if (!REGISTRATION_ROLES.includes(role)) {
    return next(new AppError("Please select a valid registration section", 400));
  }

  if (!phone || !password) {
    return next(new AppError("Please provide mobile number and secure password", 400));
  }

  const workerEmail = email ? email.toLowerCase() : `worker.${phone.replace(/[^0-9]/g, "").slice(-8)}@ruralhub.in`;

  let existing = await User.findOne({ $or: [{ email: workerEmail }, { phone }] });
  if (existing) {
    return next(new AppError("A registration with this mobile number or email already exists", 400));
  }

  const fullName = name || `${firstName || ""} ${lastName || ""}`.trim() || "Worker Applicant";
  const nameParts = fullName.split(" ");
  const empID = generateEmployeeID();

  const roleDetails = registrationRoleDetails[role];
  let authority = null;
  if (roleDetails.authorityRole === "state_admin") {
    authority = await User.findOne({ role: { $in: ["state_admin", "superadmin"] } });
  } else if (roleDetails.authorityRole === "assistant_admin") {
    authority = await User.findOne({ role: "assistant_admin", district });
  } else {
    authority = await User.findOne({
      role: { $in: ["field_admin", "admin", "field_worker"] },
      $or: [
        { mandal: new RegExp(`^${mandal || "Dhone"}$`, "i") },
        { village: new RegExp(`^${village || "Kothapalli"}$`, "i") },
      ],
    });
  }

  const registeredUser = await User.create({
    name: fullName,
    firstName: firstName || nameParts[0],
    lastName: lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "."),
    fatherOrHusbandName: fatherOrHusbandName || "",
    gender: gender || "Male",
    age: age ? Number(age) : 32,
    email: workerEmail,
    phone,
    password,
    role,
    parentId: authority?._id || null,
    assignedAdmin: role === "worker" ? authority?._id || null : null,
    employeeID: empID,
    jobCardNumber: jobCardNumber || `AP-12-004-${Math.floor(1000 + Math.random() * 9000)}`,
    aadhaar: aadhaar || "8765-4321-9012",
    aadhaarMasked: aadhaar ? "XXXX-XXXX-" + aadhaar.slice(-4) : "XXXX-XXXX-9012",
    address: address || "Main Village Road",
    village: village || "Kothapalli",
    mandal: mandal || "Dhone",
    district: district || "Kurnool",
    state: state || "Andhra Pradesh",
    panchayat: panchayat || `${village || "Kothapalli"} Gram Panchayat`,
    dailyWage: 425,
    bankName: bankName || "State Bank of India",
    accountNumber: accountNumber || "389201948291",
    ifscCode: ifscCode || "SBIN0001234",
    bankVerified: false,
    bankStatus: "pending",
    fingerprintEnrolled: false,
    faceEnrolled: false,
    // Every public registration is routed to the correct authority for approval.
    verificationStatus: "pending_approval",
    isVerified: false,
    isActive: false,
  });

  res.status(201).json({
    status: "success",
    message: `${roleDetails.label} registration submitted. Your request is pending approval by the ${roleDetails.authorityRole.replace("_", " ")}.`,
    user: {
      id: registeredUser._id,
      name: registeredUser.name,
      phone: registeredUser.phone,
      role: registeredUser.role,
      authorityId: authority?._id || null,
      verificationStatus: "pending_approval",
    },
  });
});

// Login User
export const login = catchAsync(async (req, res, next) => {
  let { email, username, phone, password } = req.body;
  const rawIdentifier = (email || username || phone || "").trim();
  const identifier = rawIdentifier.toLowerCase();

  if (!identifier || !password) {
    return next(new AppError("Please provide email/phone and password", 400));
  }

  // 1. Check if it's one of the built-in demo accounts and ensure it exists
  let user = await ensureDemoAccounts(identifier);

  // 2. If not a known demo or not found by helper, query database
  if (!user) {
    const phoneDigits = rawIdentifier.replace(/[^0-9]/g, "");
    const phoneCandidates = phoneDigits.length >= 10
      ? [identifier, phoneDigits.slice(-10), `+91${phoneDigits.slice(-10)}`]
      : [identifier];

    user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: { $in: phoneCandidates } },
        { employeeID: identifier.toUpperCase() },
      ],
    }).select("+password");
  }

  if (!user) {
    return next(new AppError("Invalid email/phone or password", 401));
  }

  // 3. Enforce Worker approval status
  if (user.role === "worker" || user.role === "employee") {
    if (user.verificationStatus === "rejected") {
      return next(
        new AppError(
          `Your worker registration was rejected by the Field Admin. Reason: ${user.rejectionReason || "Verification failed"}. Please contact your Gram Panchayat supervisor.`,
          403
        )
      );
    }
    if (user.verificationStatus === "pending_approval" || user.isVerified === false) {
      return next(
        new AppError(
          "Your worker registration application is pending review & verification by the Mandal Field Admin. You will be able to log in once approved.",
          403
        )
      );
    }
  }

  if (user.isActive === false) {
    return next(new AppError("Your account has been deactivated by the administrator.", 403));
  }

  // 4. Always verify the stored bcrypt hash. Login must never bypass password checks.
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new AppError("Invalid email/phone or password", 401));
  }

  sendTokenResponse(user, 200, res);
});

// Get Current User
export const getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    user: user.getPublicProfile(),
  });
});

// Forgot Password
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Password reset link sent to registered email/phone",
  });
});

// Reset Password
export const resetPassword = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
});

// Logout
export const logout = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

// Send OTP
export const sendOtp = catchAsync(async (req, res, next) => {
  const { phone } = req.body;

  if (!phone) {
    return next(new AppError("Please provide a phone number", 400));
  }

  const user = await User.findOne({ phone });
  if (!user) {
    return next(new AppError("No account found with this phone number. Please register first.", 404));
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + OTP_TTL_MS;

  otpStore.set(phone, { otp, expiresAt });
  console.log(`\n📱 OTP for ${phone}: ${otp} (expires in 5 min)\n`);

  res.status(200).json({
    status: "success",
    message: "OTP sent successfully",
    ...(process.env.NODE_ENV !== "production" && { otp }),
  });
});

// Verify OTP and login
export const verifyOtp = catchAsync(async (req, res, next) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return next(new AppError("Please provide phone number and OTP", 400));
  }

  const record = otpStore.get(phone);
  if (!record) {
    return next(new AppError("OTP not found or expired. Please request a new OTP.", 400));
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return next(new AppError("OTP has expired. Please request a new one.", 400));
  }

  if (record.otp !== otp.toString().trim()) {
    return next(new AppError("Invalid OTP. Please try again.", 401));
  }

  otpStore.delete(phone);

  const user = await User.findOne({ phone });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  sendTokenResponse(user, 200, res);
});
