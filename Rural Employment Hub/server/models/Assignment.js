import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide assignment title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide assignment description"],
    },
    workCategory: {
      type: String,
      enum: [
        "road-construction",
        "water-management",
        "agriculture",
        "rural-development",
        "sanitation",
        "other",
      ],
      required: true,
    },
    location: {
      state: {
        type: String,
        default: "Andhra Pradesh",
      },
      district: String,
      panchayat: String,
      village: String,
      mandal: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    startDate: {
      type: Date,
      required: [true, "Please provide start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please provide end date"],
    },
    estimatedDuration: {
      type: Number, // in days
      required: true,
    },
    dailyWage: {
      type: Number,
      required: true,
    },
    estimatedWorkers: {
      type: Number,
      required: true,
    },
    assignedEmployees: [
      {
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["assigned", "accepted", "rejected", "completed"],
          default: "assigned",
        },
        acceptedAt: Date,
        completedAt: Date,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    budget: {
      totalBudget: Number,
      spent: {
        type: Number,
        default: 0,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
AssignmentSchema.index({ status: 1 });
AssignmentSchema.index({ startDate: -1 });
AssignmentSchema.index({ createdAt: -1 });

export default mongoose.model("Assignment", AssignmentSchema);
