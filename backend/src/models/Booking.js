import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parking: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['reserved', 'active', 'completed', 'cancelled'], default: 'reserved' },
    totalAmount: { type: Number, default: 0 },
    isPreBooked: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    preBookingFee: { type: Number, default: 0 },
    arrivalWindow: { type: Number, default: 20 }, // minutes
    gracePeriod: { type: Number, default: 3 }, // minutes
    ticketId: { type: String, unique: true, sparse: true }, // 10-digit unique code
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
