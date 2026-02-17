import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  parking: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // Optional for reservations
  amount: { type: Number, required: true },
  duration: { type: Number, required: true }, // in hours
  paymentMethod: { type: String, enum: ['cash', 'online', 'qr'], required: true },
  paidAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('PaymentHistory', paymentHistorySchema);
