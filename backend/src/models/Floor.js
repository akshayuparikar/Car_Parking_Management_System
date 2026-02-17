import mongoose from "mongoose";

const floorSchema = new mongoose.Schema(
  {
    name: { type: String }, // optional
    number: { type: Number, required: true }, // floor number like 1,2,3
    parking: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
  },
  { timestamps: true }
);

// Compound index to ensure unique floor number per parking
floorSchema.index({ parking: 1, number: 1 }, { unique: true });

export default mongoose.model("Floor", floorSchema);
