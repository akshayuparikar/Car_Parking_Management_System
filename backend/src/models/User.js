import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'USER', 'SECURITY'], default: 'USER' },
    assignedParking: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking' }, // For SECURITY role only
    upiPassword: { type: String }, // Hashed password for UPI operations, only for SECURITY role
    upiId: { type: String } // UPI ID for payments, only for SECURITY role
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
