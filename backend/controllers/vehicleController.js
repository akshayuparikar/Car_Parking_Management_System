import Vehicle from '../models/Vehicle.js';
import Slot from '../models/Slot.js';
import User from '../models/User.js';

// Get all vehicles
export const getVehicles = async (req, res) => {
  try {
    const { number } = req.query;
    let query = {};
    if (number) {
      query.number = number;
    }
    const vehicles = await Vehicle.find(query)
      .populate('user')
      .populate('slot');
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Park a vehicle
export const parkVehicle = async (req, res) => {
  try {
    const { floorId, number, type } = req.body;

    // Find the first available slot on the selected floor
    const slot = await Slot.findOne({ floor: floorId, isOccupied: false });
    if (!slot) return res.status(400).json({ message: 'No available slots on this floor' });

    const vehicle = new Vehicle({
      user: req.user._id,
      slot: slot._id,
      number,
      type,
      entryTime: new Date()
    });

    await vehicle.save();

    slot.isOccupied = true;
    slot.vehicle = vehicle._id;
    await slot.save();

    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unpark a vehicle (with payment calculation)
export const unparkVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.body;

    const vehicle = await Vehicle.findById(vehicleId).populate('slot');
    if (!vehicle)
      return res.status(404).json({ message: 'Vehicle not found' });

    const exitTime = new Date();
    vehicle.exitTime = exitTime;

    // Calculate parking time
    const entryTime = vehicle.entryTime;
    const durationMs = exitTime - entryTime;
    const durationHours = durationMs / (1000 * 60 * 60);

    // Set rate (example: ₹40 / hour)
    const ratePerHour = 40;
    const amount = Math.ceil(durationHours * ratePerHour);

    // Free slot
    const slot = await Slot.findById(vehicle.slot._id);
    slot.isOccupied = false;
    slot.vehicle = null;
    await slot.save();

    await vehicle.save();

    res.json({
      message: 'Vehicle exited successfully',
      vehicle,
      durationHours: durationHours.toFixed(2),
      amount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unpark vehicle by number (for security)
export const unparkVehicleByNumber = async (req, res) => {
  try {
    const { number } = req.body;

    const vehicle = await Vehicle.findOne({ number }).populate('slot');
    if (!vehicle)
      return res.status(404).json({ message: 'Vehicle not found' });

    const exitTime = new Date();
    vehicle.exitTime = exitTime;

    // Free slot
    const slot = await Slot.findById(vehicle.slot._id);
    slot.isOccupied = false;
    slot.vehicle = null;
    await slot.save();

    await vehicle.save();

    res.json({
      message: 'Vehicle exited successfully',
      vehicle
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
