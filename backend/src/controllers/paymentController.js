import PaymentHistory from '../models/PaymentHistory.js';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';

export const addPayment = async (req, res) => {
  try {
    const { vehicleId, slotId, amount, duration, paymentMethod } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    const payment = new PaymentHistory({
      user: req.user._id,
      vehicle: vehicleId,
      slot: slotId,
      amount,
      duration,
      paymentMethod,
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await PaymentHistory.find({ user: req.user._id }).populate('vehicle');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Simplified pre-booking payment processing
export const processPreBookingPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    const booking = await Booking.findById(bookingId).populate('parking');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    if (!booking.isPreBooked) return res.status(400).json({ message: 'Not a pre-booking' });

    // Simulate payment processing (in real app, integrate with payment gateway)
    const payment = new PaymentHistory({
      user: req.user._id,
      amount: booking.preBookingFee,
      paymentMethod,
      description: `Pre-booking fee for ${booking.parking.name}`,
    });
    await payment.save();

    booking.paymentStatus = 'paid';
    await booking.save();

    res.json({ message: 'Payment processed successfully', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
