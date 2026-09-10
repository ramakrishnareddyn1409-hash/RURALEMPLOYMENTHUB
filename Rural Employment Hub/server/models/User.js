import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Please provide full name"],
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    fatherOrHusbandName: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    age: {
      type: Number,
      default: 32,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide valid email"],
    },
    phone: {
      type: String,
      required: [true, "Please provide mobile number"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 6,
      select: false,
    },

    // Role Hierarchy: state_admin > assistant_admin > field_worker > worker
    role: {
      type: String,
      enum: [
        "state_admin",
        "assistant_admin",
        "field_worker",
        "field_admin",
        "worker",
        "superadmin",
        "admin",
        "employee",
      ],
      default: "worker",
    },

    // Hierarchy link to Parent Admin
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Administrative metadata
    adminCode: {
      type: String,
      trim: true,
      default: null,
    },
    adminTitle: {
      type: String,
      trim: true,
      default: null,
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Worker Identifiers
    workerId: {
      type: String,
      unique: true,
      sparse: true,
    },
    employeeID: {
      type: String,
      sparse: true,
    },
    jobCardNumber: {
      type: String,
      sparse: true,
    },
    fingerprintId: {
      type: String,
      default: null,
    },
    occupation: {
      type: String,
      default: "Agricultural Labor / Earthwork",
    },

    // Location & Jurisdiction Details
    address: {
      type: String,
      default: "Main Village Road",
    },
    village: {
      type: String,
      trim: true,
      default: "Kothapalli",
    },
    mandal: {
      type: String,
      trim: true,
      default: "Dhone",
    },
    district: {
      type: String,
      trim: true,
      default: "Kurnool",
    },
    state: {
      type: String,
      trim: true,
      default: "Andhra Pradesh",
    },
    panchayat: {
      type: String,
      trim: true,
    },
    assignedDistricts: [
      {
        type: String,
        trim: true,
      },
    ],
    assignedMandals: [
      {
        type: String,
        trim: true,
      },
    ],
    assignedVillages: [
      {
        type: String,
        trim: true,
      },
    ],

    // Government IDs & Scheme details
    aadhaar: {
      type: String,
      sparse: true,
    },
    aadhaarMasked: {
      type: String,
      sparse: true,
    },
    dailyWage: {
      type: Number,
      default: 425,
    },

    // Bank Details for Direct Benefit Transfer (DBT)
    bankName: {
      type: String,
      default: "State Bank of India",
    },
    accountNumber: {
      type: String,
      default: "389201948291",
    },
    accountHolderName: String,
    ifscCode: {
      type: String,
      default: "SBIN0001234",
    },
    bankVerified: {
      type: Boolean,
      default: true,
    },
    bankStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "verified",
    },

    // Photo & AI Face Recognition Embeddings
    profilePhoto: {
      type: String,
      default: null,
    },
    faceImages: [
      {
        angle: String, // "front", "left", "right", "up", "smile"
        dataUrl: String,
        capturedAt: { type: Date, default: Date.now },
      },
    ],
    faceDescriptors: [
      {
        type: Number, // 128-dimensional embedding vector
      },
    ],
    faceEnrolled: {
      type: Boolean,
      default: false,
    },
    faceEnrolledAt: {
      type: Date,
      default: null,
    },
    fingerprintEnrolled: {
      type: Boolean,
      default: true,
    },
    qrCodeData: {
      type: String,
      default: null,
    },

    // Status & Approvals
    employmentStatus: {
      type: String,
      enum: ["active", "inactive", "on-leave", "terminated"],
      default: "active",
    },
    verificationStatus: {
      type: String,
      enum: ["pending_approval", "approved", "rejected"],
      default: "approved",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Populate combined name and ensure first/last name & workerId
UserSchema.pre("validate", function (next) {
  if (this.name && (!this.firstName || !this.lastName)) {
    const parts = this.name.trim().split(" ");
    this.firstName = this.firstName || parts[0];
    this.lastName = this.lastName || (parts.length > 1 ? parts.slice(1).join(" ") : ".");
  } else if (!this.name && (this.firstName || this.lastName)) {
    this.name = `${this.firstName || ""} ${this.lastName || ""}`.trim();
  }
  if (!this.workerId && this.employeeID) {
    this.workerId = this.employeeID;
  }
  if (!this.employeeID && this.workerId) {
    this.employeeID = this.workerId;
  }
  if (!this.workerId) {
    this.workerId = "WRK-" + Math.floor(1000 + Math.random() * 9000);
    this.employeeID = this.workerId;
  }
  if (!this.fingerprintId) {
    this.fingerprintId = "FP-" + (this.workerId || "001");
  }
  if (!this.qrCodeData && this.workerId) {
    this.qrCodeData = JSON.stringify({
      workerId: this.workerId,
      name: this.name,
      phone: this.phone,
      village: this.village,
      jobCard: this.jobCardNumber || this.workerId,
    });
  }
  next();
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get public profile
UserSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.faceDescriptors;
  delete userObject.faceImages;
  return userObject;
};

export default mongoose.model("User", UserSchema);
