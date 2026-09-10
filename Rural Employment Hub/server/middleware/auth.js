import jwt from "jsonwebtoken";
import { AppError } from "./globalErrorHandler.js";

// Helper to normalize roles
export const normalizeRole = (role) => {
  if (role === "superadmin") return "state_admin";
  if (role === "field_worker") return "worker";
  if (role === "employee") return "worker";
  return role;
};

// Protect Routes - Authentication Middleware
export const protect = (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new AppError("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "rural_hub_jwt_secret_key_2026_secure");
    
    // Normalize role for backwards compatibility
    if (decoded.role) {
      decoded.normalizedRole = normalizeRole(decoded.role);
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError("Not authorized to access this route", 401));
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const normalized = req.user.normalizedRole || normalizeRole(userRole);

    const allowed = roles.some(
      (r) => r === userRole || r === normalized || normalizeRole(r) === normalized
    );

    if (!allowed) {
      return next(
        new AppError(
          `User role '${userRole}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// State Admin Only (Top Authority)
export const stateAdminOnly = (req, res, next) => {
  const role = req.user.normalizedRole || normalizeRole(req.user.role);
  if (role !== "state_admin") {
    return next(new AppError("Only State Admin can access this resource", 403));
  }
  next();
};

// Assistant Admin and above
export const assistantAdminOrAbove = (req, res, next) => {
  const role = req.user.normalizedRole || normalizeRole(req.user.role);
  if (role !== "state_admin" && role !== "assistant_admin") {
    return next(new AppError("Only Assistant Admin or State Admin can access this resource", 403));
  }
  next();
};

// Field Admin and above
export const fieldAdminOrAbove = (req, res, next) => {
  const role = req.user.normalizedRole || normalizeRole(req.user.role);
  if (role !== "state_admin" && role !== "assistant_admin" && role !== "field_admin" && req.user.role !== "admin") {
    return next(new AppError("Admin access required for this resource", 403));
  }
  next();
};

// Admin Or SuperAdmin (Backward compatibility)
export const adminOnly = (req, res, next) => {
  const role = req.user.normalizedRole || normalizeRole(req.user.role);
  if (role !== "state_admin" && role !== "assistant_admin" && role !== "field_admin" && req.user.role !== "admin" && req.user.role !== "superadmin") {
    return next(new AppError("Administrative access required", 403));
  }
  next();
};

// SuperAdmin Only (Backward compatibility)
export const superAdminOnly = (req, res, next) => {
  const role = req.user.normalizedRole || normalizeRole(req.user.role);
  if (role !== "state_admin") {
    return next(new AppError("Only State Admin / Super Admin can access this route", 403));
  }
  next();
};

// Employee / Worker Only
export const employeeOnly = (req, res, next) => {
  const role = req.user.normalizedRole || normalizeRole(req.user.role);
  if (role !== "worker") {
    return next(new AppError("Only Workers can access this route", 403));
  }
  next();
};
