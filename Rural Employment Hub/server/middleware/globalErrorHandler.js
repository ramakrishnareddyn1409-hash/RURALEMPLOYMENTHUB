// Global Error Handler Middleware
export const globalErrorHandler = (err, req, res, next) => {
  if (err.statusCode && err.statusCode < 500) {
    console.warn(`[${err.statusCode}] ${err.message}`);
  } else {
    console.error(err);
  }

  // Default error properties
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Send response
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Custom Error Class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
