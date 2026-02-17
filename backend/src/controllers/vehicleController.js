import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import Slot from '../models/Slot.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import PaymentHistory from '../models/PaymentHistory.js';

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

    // For security users, ensure the floor belongs to their assigned parking
    if (req.user.role === 'SECURITY') {
      if (!req.user.assignedParking) {
        return res.status(400).json({ message: 'Security user not assigned to any parking' });
      }
      // Note: Floor check moved below to accommodate pre-booking slot lookup
    }

    // Handle Ticket ID Logic (Pre-booking vs Walk-in)
    const { ticketId } = req.body;
    let bookingId = null;
    let finalTicketId = ticketId;
    let slot = null;

    if (ticketId) {
      // Verify booking if ticketId is provided (Pre-booking Check-in)
      const booking = await Booking.findOne({ ticketId }).populate({
        path: 'slot',
        populate: { path: 'floor' }
      });
      if (!booking) return res.status(404).json({ message: 'Invalid Ticket ID' });
      if (booking.status !== 'reserved') {
        return res.status(400).json({ message: `Booking is already ${booking.status}` });
      }
      bookingId = booking._id;
      slot = booking.slot;

      // Security: Verify this slot belongs to assigned parking
      if (req.user.role === 'SECURITY') {
        const bookingParkingId = slot.floor.parking.toString();
        const securityParkingId = req.user.assignedParking.toString();

        if (bookingParkingId !== securityParkingId) {
          return res.status(403).json({
            message: `Access Denied: Booking is for Parking ${bookingParkingId} but you are at ${securityParkingId}`
          });
        }
      }

      // Update booking status to active
      booking.status = 'active';
      await booking.save();
    } else {
      // Walk-in: Generate new Ticket ID
      finalTicketId = Math.random().toString().slice(2, 12);

      // Security check for floor (provided in body for walk-in)
      if (req.user.role === 'SECURITY') {
        const floorObj = await Slot.findOne({ floor: floorId }).populate('floor');
        if (!floorObj || floorObj.floor.parking.toString() !== req.user.assignedParking.toString()) {
          return res.status(403).json({ message: 'Unauthorized: Floor does not belong to assigned parking' });
        }
      }

      // Find the first available slot on the selected floor
      slot = await Slot.findOne({ floor: floorId, isOccupied: false });
      if (!slot) return res.status(400).json({ message: 'No available slots on this floor' });
    }

    const vehicle = new Vehicle({
      user: req.user._id,
      parking: req.user.role === 'SECURITY' ? req.user.assignedParking : req.body.parkingId, // Use assigned parking for security
      slot: slot._id,
      number,
      type,
      entryTime: new Date(),
      ticketId: finalTicketId,
      booking: bookingId
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

// Calculate exit amount for a vehicle (without exiting)
export const calculateExitAmount = async (req, res) => {
  try {
    const { vehicleId } = req.body;

    const vehicle = await Vehicle.findById(vehicleId).populate('slot');
    if (!vehicle)
      return res.status(404).json({ message: 'Vehicle not found' });

    if (!vehicle.entryTime || vehicle.exitTime)
      return res.status(400).json({ message: 'Vehicle is not currently parked' });

    if (!vehicle.slot)
      return res.status(400).json({ message: 'Vehicle has no assigned slot' });

    const exitTime = new Date();

    // Calculate parking time
    const entryTime = vehicle.entryTime;
    const durationMs = exitTime - entryTime;
    const durationHours = durationMs / (1000 * 60 * 60);

    // Set rate (example: ₹40 / hour)
    const ratePerHour = 40;
    const amount = Math.ceil(durationHours * ratePerHour);

    res.json({
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

    // For security users, ensure the vehicle belongs to their assigned parking
    if (req.user.role === 'SECURITY') {
      if (!req.user.assignedParking) {
        return res.status(400).json({ message: 'Security user not assigned to any parking' });
      }
    }

    const vehicle = await Vehicle.findOne({ number }).populate({
      path: 'slot',
      populate: { path: 'floor', populate: { path: 'parking' } }
    });
    if (!vehicle)
      return res.status(404).json({ message: 'Vehicle not found' });

    // Check if vehicle is in security's assigned parking
    if (req.user.role === 'SECURITY' && vehicle.slot.floor.parking._id.toString() !== req.user.assignedParking.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Vehicle not in assigned parking' });
    }

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

// Get occupied slots with vehicle details for security exit
export const getOccupiedSlotsForSecurity = async (req, res) => {
  try {
    const slots = await Slot.find({ isOccupied: true })
      .populate({
        path: 'vehicle',
        populate: { path: 'user' }
      })
      .populate('floor');

    const result = slots.map(slot => ({
      slotId: slot._id,
      slotNumber: slot.slotNumber,
      floorName: slot.floor.name,
      floorNumber: slot.floor.number,
      vehicleId: slot.vehicle._id,
      vehicleNumber: slot.vehicle.number,
      vehicleType: slot.vehicle.type,
      entryTime: slot.vehicle.entryTime
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Process payment and exit vehicle at security
export const processExitPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { vehicleId } = req.params;
    const { paymentMethod } = req.body;

    // For security users, ensure the vehicle belongs to their assigned parking
    if (req.user.role === 'SECURITY') {
      if (!req.user.assignedParking) {
        return res.status(400).json({ message: 'Security user not assigned to any parking' });
      }
    }

    const vehicle = await Vehicle.findById(vehicleId).populate({
      path: 'slot',
      populate: { path: 'floor', populate: { path: 'parking' } }
    }).session(session);
    if (!vehicle)
      return res.status(404).json({ message: 'Vehicle not found' });

    // Check if vehicle is in security's assigned parking
    if (req.user.role === 'SECURITY' && vehicle.slot.floor.parking._id.toString() !== req.user.assignedParking.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Vehicle not in assigned parking' });
    }

    if (!vehicle.entryTime || vehicle.exitTime)
      return res.status(400).json({ message: 'Vehicle is not currently parked' });

    if (!vehicle.slot)
      return res.status(400).json({ message: 'Vehicle has no assigned slot' });

    const exitTime = new Date();
    const entryTime = vehicle.entryTime;
    const durationMs = exitTime - entryTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    const ratePerHour = 40;
    const amount = Math.ceil(durationHours * ratePerHour);

    // Create payment record
    const payment = new PaymentHistory({
      user: vehicle.user,
      vehicle: vehicleId,
      parking: vehicle.slot.floor.parking._id,
      slot: vehicle.slot._id,
      amount,
      duration: durationHours,
      paymentMethod
    });
    await payment.save({ session });

    // Update vehicle
    vehicle.exitTime = exitTime;
    await vehicle.save({ session });

    // Free slot
    const slot = await Slot.findById(vehicle.slot._id).session(session);
    slot.isOccupied = false;
    slot.vehicle = null;
    await slot.save({ session });

    // Update Booking status if exists
    if (vehicle.booking || vehicle.ticketId) {
      const bookingQuery = vehicle.booking
        ? { _id: vehicle.booking }
        : { ticketId: vehicle.ticketId };

      const booking = await Booking.findOne(bookingQuery).session(session);
      if (booking) {
        booking.status = 'completed';
        booking.paymentStatus = 'paid'; // Ensure payment is marked as paid
        await booking.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Payment processed and vehicle exited successfully',
      payment,
      vehicle,
      durationHours: durationHours.toFixed(2),
      amount
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};
