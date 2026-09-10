import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    // Worker / Employee reference
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
    workerPhone: {
      type: String,
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

    // Attendance linking
    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
    },

    // Wage Calculation
    amount: {
      type: Number,
      required: true,
      default: 850,
    },
    totalAmount: {
      type: Number,
    },
    dailyWage: {
      type: Number,
      default: 425,
    },
    workingDays: {
      type: Number,
      default: 2,
    },

    // Status
    paymentStatus: {
      type: String,
      enum: ["pending", "approved", "credited", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "credited", "paid", "rejected"],
      default: "pending",
    },

    // Banking & Transaction Details
    paymentMethod: {
      type: String,
      enum: ["Direct Benefit Transfer (DBT)", "Bank Transfer", "UPI", "Cash"],
      default: "Direct Benefit Transfer (DBT)",
    },
    bankName: {
      type: String,
      default: "State Bank of India",
    },
    accountNumber: {
      type: String,
      default: "389201948291",
    },
    ifscCode: {
      type: String,
      default: "SBIN0001234",
    },
    transactionId: {
      type: String,
      default: function () {
        return "TXN-DBT-" + Math.floor(100000000 + Math.random() * 900000000);
      },
    },
    transactionID: String,
    creditedDate: {
      type: Date,
      default: null,
    },
    paidDate: Date,

    // SMS Notifications
    smsSent: {
      type: Boolean,
      default: false,
    },
    smsMessage: {
      type: String,
      default: "",
    },
    smsSentAt: {
      type: Date,
      default: null,
    },

    // Administrative remarks
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    remarks: {
      type: String,
      default: "Rural Employment Wage Disbursement",
    },
  },
  { timestamps: true }
);

// Sync aliases before save
PaymentSchema.pre("save", function (next) {
  if (!this.employee && this.workerId) {
    this.employee = this.workerId;
  }
  if (!this.workerId && this.employee) {
    this.workerId = this.employee;
  }
  if (!this.totalAmount && this.amount) {
    this.totalAmount = this.amount;
  }
  if (!this.amount && this.totalAmount) {
    this.amount = this.totalAmount;
  }
  if (!this.transactionID && this.transactionId) {
    this.transactionID = this.transactionId;
  }
  if (!this.transactionId && this.transactionID) {
    this.transactionId = this.transactionID;
  }
  if (this.paymentStatus === "credited" && !this.creditedDate) {
    this.creditedDate = new Date();
    this.paidDate = this.creditedDate;
  }
  next();
});

// Index for high-performance scoped queries
PaymentSchema.index({ workerId: 1, createdAt: -1 });
PaymentSchema.index({ fieldAdminId: 1, createdAt: -1 });
PaymentSchema.index({ assistantAdminId: 1, createdAt: -1 });
PaymentSchema.index({ paymentStatus: 1 });

export default mongoose.model("Payment", PaymentSchema);
