import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    // Worker reference
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide worker ID"],
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    employeeID: {
      type: String,
    },
    workerName: {
      type: String,
    },
    village: {
      type: String,
      default: "Kothapalli",
    },
    mandal: {
      type: String,
      default: "Dhone",
    },
    district: {
      type: String,
      default: "Kurnool",
    },

    // Administrative hierarchy references
    fieldAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assistantAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    adminName: {
      type: String,
      default: "Field Admin",
    },
    adminCode: {
      type: String,
      default: "FIELD_ADMIN_01",
    },

    // Date & Time
    attendanceDate: {
      type: Date,
      required: [true, "Please provide attendance date"],
      default: Date.now,
    },
    attendanceDay: {
      type: String,
      trim: true,
      index: true,
    },
    date: {
      type: Date,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },

    // Attendance & Biometrics
    attendanceStatus: {
      type: String,
      enum: ["Present", "Absent", "Half Day", "present", "absent", "half-day", "leave"],
      default: "Present",
    },
    status: {
      type: String,
      default: "present",
    },
    verificationMethod: {
      type: String,
      enum: ["Face", "Fingerprint", "manual", "face-recognition", "fingerprint"],
      default: "Face",
    },
    faceVerified: {
      type: Boolean,
      default: false,
    },
    fingerprintVerified: {
      type: Boolean,
      default: false,
    },
    confidenceScore: {
      type: Number,
      default: 96.5,
    },
    capturedFaceThumbnail: {
      type: String,
      default: null,
    },

    // Geolocation & Device Metadata
    gpsLocation: {
      latitude: { type: Number, default: 15.4167 }, // Dhone / Kurnool coordinates
      longitude: { type: Number, default: 77.8833 },
      address: { type: String, default: "Muster Center, Kothapalli Gram Panchayat, Dhone Mandal" },
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    deviceId: {
      type: String,
      default: function () {
        return "BIO-TAB-" + Math.floor(100 + Math.random() * 900);
      },
    },

    // Wage and Payment workflow
    wageAmount: {
      type: Number,
      default: 425,
    },
    paymentStatus: {
      type: String,
      enum: ["pending_approval", "approved", "released", "credited", "rejected"],
      default: "pending_approval",
    },

    // Verification details
    isVerified: {
      type: Boolean,
      default: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    remarks: String,
  },
  { timestamps: true }
);

// Sync aliases before save
AttendanceSchema.pre("save", function (next) {
  if (!this.employee && this.workerId) {
    this.employee = this.workerId;
  }
  if (!this.workerId && this.employee) {
    this.workerId = this.employee;
  }
  if (!this.date && this.attendanceDate) {
    this.date = this.attendanceDate;
  }
  if (!this.attendanceDate && this.date) {
    this.attendanceDate = this.date;
  }
  if (this.verificationMethod === "Face") {
    this.faceVerified = true;
  }
  if (this.verificationMethod === "Fingerprint") {
    this.fingerprintVerified = true;
  }
  if (!this.location && this.gpsLocation) {
    this.location = this.gpsLocation;
  }
  if (!this.attendanceDay && this.attendanceDate) {
    this.attendanceDay = new Intl.DateTimeFormat("en-CA", {
      timeZone: process.env.ATTENDANCE_TIMEZONE || "Asia/Kolkata",
    }).format(this.attendanceDate);
  }
  next();
});

// Index for high-performance scoped queries
AttendanceSchema.index({ workerId: 1, attendanceDate: -1 });
AttendanceSchema.index({ fieldAdminId: 1, attendanceDate: -1 });
AttendanceSchema.index({ assistantAdminId: 1, attendanceDate: -1 });
AttendanceSchema.index({ attendanceDate: -1 });
AttendanceSchema.index({ village: 1, attendanceDate: -1 });
AttendanceSchema.index({ workerId: 1, attendanceDay: 1 }, { unique: true, sparse: true });

export default mongoose.model("Attendance", AttendanceSchema);
