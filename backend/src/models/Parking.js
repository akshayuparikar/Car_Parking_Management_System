import mongoose from 'mongoose';

const parkingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who owns the parking
    securityUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Securities assigned to this parking
    pricing: {
      hourlyRate: { type: Number, required: true, default: 10 }, // Rate per hour
      dailyRate: { type: Number, required: true, default: 100 }, // Flat daily rate
      peakTimeMultiplier: { type: Number, default: 1.5 }, // Multiplier for peak hours
      peakHours: {
        start: { type: String, default: '08:00' }, // HH:MM
        end: { type: String, default: '18:00' },
      },
      preBookingExtraCharge: { type: Number, default: 2 }, // Extra charge per hour for pre-booking
      fixedPreBookingFee: { type: Number, default: 5 }, // Fixed fee for pre-booking
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    operationalStatus: { type: String, enum: ['open', 'closed', 'full'], default: 'open' }, // Operational status
    temporarilyClosed: { type: Boolean, default: false }, // For manual closure
    upiId: { type: String, default: 'parking@upi' }, // UPI ID for parking payments
    amenities: {
      type: [String],
      default: ['CCTV', 'Security', '24/7']
    }, // List of amenities
  },
  { timestamps: true }
);

// Geo-spatial index for location
parkingSchema.index({ location: '2dsphere' });

export default mongoose.model('Parking', parkingSchema);
