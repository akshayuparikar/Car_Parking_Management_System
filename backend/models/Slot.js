import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    floor: { type: mongoose.Schema.Types.ObjectId, ref: "Floor", required: true },
    slotNumber: { type: Number, required: true }, // slot like 1,2,3  (number is better than string)
    isOccupied: { type: Boolean, default: false },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Slot", slotSchema);
