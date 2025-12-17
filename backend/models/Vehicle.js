import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", default: null },

    number: { type: String, required: true, trim: true }, // vehicle number
    type: { type: String, required: true }, // car/bike/etc

    entryTime: { type: Date, default: null },
    exitTime: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
