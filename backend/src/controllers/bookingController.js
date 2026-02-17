import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Parking from '../models/Parking.js';
import Slot from '../models/Slot.js';
import Vehicle from '../models/Vehicle.js';
import Floor from '../models/Floor.js';

// --------------------------------------------------
// CREATE BOOKING (User only)
// --------------------------------------------------
export const createBooking = async (req, res) => {
  try {
    const { parkingId, startTime, endTime, isPreBooked = false, userLat, userLng, vehicleType = 'car' } = req.body;

    // Validate dates
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const parking = await Parking.findById(parkingId);
    if (!parking) return res.status(404).json({ message: 'Parking not found' });

    // Check distance (Skip for Pre-booking)
    if (userLat && userLng && !isPreBooked) {
      const distance = calculateDistance(userLat, userLng, parking.location.coordinates[1], parking.location.coordinates[0]);
      if (distance > 3) {
        return res.status(400).json({ message: 'You must be within 3 km to book "Park Now". Use "Pre-book" instead.' });
      }
    }

    // AUTO-ALLOCATION LOGIC
    // 1. Find all slots in this parking of the requested type
    const floors = await Floor.find({ parking: parkingId });
    const floorIds = floors.map(f => f._id);

    // Normalize type
    const type = vehicleType.toLowerCase();

    const candidateSlots = await Slot.find({
      floor: { $in: floorIds },
      type: type
    });

    if (candidateSlots.length === 0) {
      return res.status(400).json({ message: `No ${type} slots available in this parking` });
    }

    // 2. Find conflicting bookings for these slots in the time range
    const conflictingBookings = await Booking.find({
      slot: { $in: candidateSlots.map(s => s._id) },
      status: { $in: ['reserved', 'active'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    }).select('slot');

    const busySlotIds = conflictingBookings.map(b => b.slot.toString());

    // 3. Pick first available slot
    const freeSlot = candidateSlots.find(s => !busySlotIds.includes(s._id.toString()));

    if (!freeSlot) {
      return res.status(400).json({ message: 'All slots are fully booked for this time period' });
    }

    // Calculate Amount
    const hours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
    let totalAmount = hours * parking.pricing.hourlyRate;
    let preBookingFee = 0;

    if (isPreBooked) {
      preBookingFee = parking.pricing.fixedPreBookingFee + (hours * parking.pricing.preBookingExtraCharge);
      totalAmount += preBookingFee;
    }

    const booking = new Booking({
      user: req.user._id,
      parking: parkingId,
      slot: freeSlot._id,
      startTime,
      endTime,
      totalAmount,
      isPreBooked,
      paymentStatus: isPreBooked ? 'paid' : 'pending',
      preBookingFee,
      ticketId: `TKT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`, // e.g. TKT-A1B2C3
    });

    await booking.save();

    // Populate slot details for response to user
    await booking.populate('slot');

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Helper function to calculate distance
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// --------------------------------------------------
// GET USER BOOKINGS (User only)
// --------------------------------------------------
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('parking', 'name address')
      .populate('slot', 'slotNumber type')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// CANCEL BOOKING (User only, with arrival window and slot-based rules for pre-bookings)
// --------------------------------------------------
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('parking');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status !== 'reserved') {
      return res.status(400).json({ message: 'Cannot cancel active or completed booking' });
    }

    // For non-pre-booked bookings, allow cancellation
    if (!booking.isPreBooked) {
      booking.status = 'cancelled';
      await booking.save();
      return res.json({ message: 'Booking cancelled' });
    }

    // For pre-booked bookings, check arrival window and available slots
    const now = new Date();
    const bookingTime = new Date(booking.createdAt);
    const timeSinceBooking = (now - bookingTime) / (1000 * 60); // minutes

    const arrivalWindow = booking.arrivalWindow; // 20 minutes
    const gracePeriod = booking.gracePeriod; // 3 minutes
    const totalGrace = arrivalWindow + gracePeriod; // 23 minutes

    // Get available slots in the parking
    const floors = await Floor.find({ parking: booking.parking._id });
    const slots = await Slot.find({ floor: { $in: floors.map(f => f._id) } });
    const availableSlots = slots.filter(s => !s.isOccupied).length;

    if (availableSlots > 5) {
      // Do not cancel until 50 minutes
      if (timeSinceBooking < 50) {
        return res.status(400).json({ message: 'Cannot cancel booking yet. Cancellation allowed after 50 minutes.' });
      }
    } else {
      // Strict cancellation after grace period
      if (timeSinceBooking < totalGrace) {
        return res.status(400).json({ message: 'Cannot cancel booking within the arrival window and grace period.' });
      }
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// GET PARKING BOOKINGS (Admin/Owner/Security)
// --------------------------------------------------
export const getParkingBookings = async (req, res) => {
  try {
    const { parkingId } = req.params;

    const parking = await Parking.findById(parkingId);

    if (!parking) return res.status(404).json({ message: 'Parking not found' });

    // Check access
    const isOwner = parking.owner.toString() === req.user._id.toString();
    const isSecurity = parking.securityUsers.includes(req.user._id);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isAdmin && !isOwner && !isSecurity) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bookings = await Booking.find({ parking: parkingId })
      .populate('user', 'name email')
      .populate('slot', 'slotNumber type')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// GET BOOKING BY TICKET ID (Security)
// --------------------------------------------------
export const getBookingByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const booking = await Booking.findOne({ ticketId })
      .populate('user', 'name email')
      .populate('slot')
      .populate('parking');

    if (!booking) {
      return res.status(404).json({ message: 'Invalid Ticket ID' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
