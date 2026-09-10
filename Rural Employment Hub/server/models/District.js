import mongoose from "mongoose";

const DistrictSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    state: {
      type: String,
      default: "Andhra Pradesh",
    },
    totalMandals: {
      type: Number,
      default: 0,
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

export default mongoose.model("District", DistrictSchema);
