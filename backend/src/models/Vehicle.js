import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parking: { type: mongoose.Schema.Types.ObjectId, ref: "Parking", required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", default: null },

    number: { type: String, required: true, trim: true }, // vehicle number
    type: { type: String, required: true }, // car/bike/etc

    entryTime: { type: Date, default: null },
    exitTime: { type: Date, default: null },

    ticketId: { type: String, unique: true, sparse: true }, // Link to booking or walk-in ticket
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null }, // Link if pre-booked
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
