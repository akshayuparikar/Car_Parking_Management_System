import PaymentHistory from '../models/PaymentHistory.js';
import Vehicle from '../models/Vehicle.js';

export const addPayment = async (req, res) => {
  try {
    const { vehicleId, amount } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    const payment = new PaymentHistory({
      user: req.user._id,
      vehicle: vehicleId,
      amount,
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
