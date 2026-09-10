import mongoose from "mongoose";

const VillageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    mandal: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    panchayat: {
      type: String,
      default: "",
    },
    totalWorkers: {
      type: Number,
      default: 0,
    },
    assignedFieldAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

VillageSchema.index({ name: 1, mandal: 1, district: 1 }, { unique: true });

export default mongoose.model("Village", VillageSchema);
