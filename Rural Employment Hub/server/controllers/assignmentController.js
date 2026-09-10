import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";
import { AppError } from "../middleware/globalErrorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

// Create Assignment
export const createAssignment = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    workCategory,
    location,
    startDate,
    endDate,
    estimatedDuration,
    dailyWage,
    estimatedWorkers,
    budget,
  } = req.body;

  const assignment = await Assignment.create({
    title,
    description,
    workCategory,
    location,
    startDate,
    endDate,
    estimatedDuration,
    dailyWage,
    estimatedWorkers,
    budget,
    createdBy: req.user.id,
    status: "pending",
  });

  res.status(201).json({
    status: "success",
    message: "Assignment created successfully",
    assignment,
  });
});

// Get All Assignments
export const getAllAssignments = catchAsync(async (req, res, next) => {
  const { status, workCategory } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};

  if (status) filter.status = status;
  if (workCategory) filter.workCategory = workCategory;

  const assignments = await Assignment.find(filter)
    .populate("createdBy", "firstName lastName")
    .skip(skip)
    .limit(limit)
    .sort({ startDate: -1 });

  const total = await Assignment.countDocuments(filter);

  res.status(200).json({
    status: "success",
    total,
    page,
    pages: Math.ceil(total / limit),
    assignments,
  });
});

// Get Employee's Assignments
export const getEmployeeAssignments = catchAsync(async (req, res, next) => {
  const { employeeID } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const employee = await User.findOne({ employeeID });
  if (!employee) {
    return next(new AppError("Employee not found", 404));
  }

  const assignments = await Assignment.find({
    "assignedEmployees.employee": employee._id,
  })
    .skip(skip)
    .limit(limit)
    .sort({ startDate: -1 });

  const total = await Assignment.countDocuments({
    "assignedEmployees.employee": employee._id,
  });

  res.status(200).json({
    status: "success",
    total,
    page,
    pages: Math.ceil(total / limit),
    assignments,
  });
});

// Get Single Assignment
export const getAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate("createdBy", "firstName lastName email")
    .populate("assignedEmployees.employee", "firstName lastName email employeeID");

  if (!assignment) {
    return next(new AppError("Assignment not found", 404));
  }

  res.status(200).json({
    status: "success",
    assignment,
  });
});

// Assign Employees to Assignment
export const assignEmployeesToAssignment = catchAsync(async (req, res, next) => {
  const { employeeIDs } = req.body;

  if (!employeeIDs || !Array.isArray(employeeIDs) || employeeIDs.length === 0) {
    return next(new AppError("Please provide an array of employeeIDs to allocate", 400));
  }

  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new AppError("Assignment project not found", 404));
  }

  // Find employees matching either MongoDB _id or employeeID string
  const validMongoIds = employeeIDs.filter((id) => mongoose.isValidObjectId(id));
  const employees = await User.find({
    $or: [
      { _id: { $in: validMongoIds } },
      { employeeID: { $in: employeeIDs } },
    ],
  });

  if (employees.length === 0) {
    return next(new AppError("No matching employees found in database", 404));
  }

  // Add employees to assignment roster
  employees.forEach((emp) => {
    const exists = assignment.assignedEmployees.some(
      (e) => e.employee.toString() === emp._id.toString()
    );
    if (!exists) {
      assignment.assignedEmployees.push({
        employee: emp._id,
        status: "assigned",
      });
    }
  });

  await assignment.save();
  await assignment.populate("assignedEmployees.employee", "firstName lastName email employeeID village phone");

  res.status(200).json({
    status: "success",
    message: `${employees.length} workers allocated to project roster successfully`,
    assignment,
  });
});

// Update Assignment Status
export const updateAssignmentStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  let assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new AppError("Assignment not found", 404));
  }

  assignment.status = status;
  await assignment.save();

  res.status(200).json({
    status: "success",
    message: "Assignment status updated successfully",
    assignment,
  });
});

// Employee Accept/Reject Assignment
export const respondToAssignment = catchAsync(async (req, res, next) => {
  const { assignmentID } = req.params;
  const { response } = req.body; // "accepted" or "rejected"

  const assignment = await Assignment.findById(assignmentID);

  if (!assignment) {
    return next(new AppError("Assignment not found", 404));
  }

  const user = await User.findById(req.user.id);

  const assignedEmployee = assignment.assignedEmployees.find(
    (e) => e.employee.toString() === user._id.toString()
  );

  if (!assignedEmployee) {
    return next(new AppError("Assignment not assigned to this employee", 400));
  }

  assignedEmployee.status = response;
  if (response === "accepted") {
    assignedEmployee.acceptedAt = new Date();
  }

  await assignment.save();

  res.status(200).json({
    status: "success",
    message: `Assignment ${response} successfully`,
    assignment,
  });
});

// Get Active Assignments
export const getActiveAssignments = catchAsync(async (req, res, next) => {
  const now = new Date();

  const assignments = await Assignment.find({
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .populate("createdBy", "firstName lastName")
    .sort({ startDate: 1 });

  res.status(200).json({
    status: "success",
    count: assignments.length,
    assignments,
  });
});
