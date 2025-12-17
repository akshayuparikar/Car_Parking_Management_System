import mongoose from "mongoose";

const floorSchema = new mongoose.Schema(
  {
    name: { type: String }, // optional
    number: { type: Number, required: true, unique: true }, // floor number like 1,2,3
  },
  { timestamps: true }
);

export default mongoose.model("Floor", floorSchema);
