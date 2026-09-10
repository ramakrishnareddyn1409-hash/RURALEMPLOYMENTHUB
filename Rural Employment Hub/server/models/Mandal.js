import mongoose from "mongoose";

const MandalSchema = new mongoose.Schema(
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
    district: {
      type: String,
      required: true,
      trim: true,
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      default: null,
    },
    totalVillages: {
      type: Number,
      default: 0,
    },
    totalWorkers: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index so name is unique per district
MandalSchema.index({ name: 1, district: 1 }, { unique: true });

export default mongoose.model("Mandal", MandalSchema);
