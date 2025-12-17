import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  amount: { type: Number, required: true },
  paidAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('PaymentHistory', paymentHistorySchema);