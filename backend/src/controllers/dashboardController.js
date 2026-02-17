import Floor from '../models/Floor.js';
import Slot from '../models/Slot.js';
import Vehicle from '../models/Vehicle.js';
import PaymentHistory from '../models/PaymentHistory.js';
import User from '../models/User.js';

export const getDashboard = async (req, res) => {
  try {
    // Overall counts
    const totalFloors = await Floor.countDocuments();
    const totalSlots = await Slot.countDocuments();
    const occupiedSlots = await Slot.countDocuments({ isOccupied: true });
    const availableSlots = totalSlots - occupiedSlots;

    const totalVehicles = await Vehicle.countDocuments();
    const totalPayments = await PaymentHistory.countDocuments();
    const totalUsers = await User.countDocuments();

    // Floor-wise details
    const floors = await Floor.find().populate('parking', 'name');

    const floorStats = await Promise.all(
      floors.map(async (floor) => {
        const total = await Slot.countDocuments({ floor: floor._id });
        const occupied = await Slot.countDocuments({
          floor: floor._id,
          isOccupied: true
        });

        return {
          floorId: floor._id,
          floorName: floor.name,
          floorNumber: floor.number,
          parkingName: floor.parking ? floor.parking.name : 'Unknown Parking',
          totalSlots: total,
          occupiedSlots: occupied,
          availableSlots: total - occupied
        };
      })
    );

    res.json({
      totals: {
        totalFloors,
        totalSlots,
        availableSlots,
        occupiedSlots,
        totalVehicles,
        totalPayments,
        totalUsers
      },
      floors: floorStats
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPublicDashboard = async (req, res) => {
  try {
    // Overall counts
    const totalSlots = await Slot.countDocuments();
    const occupiedSlots = await Slot.countDocuments({ isOccupied: true });
    const availableSlots = totalSlots - occupiedSlots;

    // Floor-wise details
    const floors = await Floor.find().populate('parking', 'name');

    const floorStats = await Promise.all(
      floors.map(async (floor) => {
        const total = await Slot.countDocuments({ floor: floor._id });
        const occupied = await Slot.countDocuments({ floor: floor._id, isOccupied: true });

        const carTotal = await Slot.countDocuments({ floor: floor._id, type: 'car' });
        const carOccupied = await Slot.countDocuments({ floor: floor._id, type: 'car', isOccupied: true });

        const bikeTotal = await Slot.countDocuments({ floor: floor._id, type: 'bike' });
        const bikeOccupied = await Slot.countDocuments({ floor: floor._id, type: 'bike', isOccupied: true });

        return {
          floorId: floor._id,
          floorName: floor.name,
          floorNumber: floor.number,
          parkingName: floor.parking ? floor.parking.name : 'Unknown Parking',
          totalSlots: total,
          occupiedSlots: occupied,
          availableSlots: total - occupied,
          stats: {
            car: { total: carTotal, occupied: carOccupied, available: carTotal - carOccupied },
            bike: { total: bikeTotal, occupied: bikeOccupied, available: bikeTotal - bikeOccupied }
          }
        };
      })
    );

    res.json({
      totals: {
        totalSlots,
        availableSlots,
        occupiedSlots
      },
      floors: floorStats
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSecurityDashboard = async (req, res) => {
  try {
    if (!req.user.assignedParking) {
      return res.status(400).json({ message: 'Security user not assigned to any parking' });
    }

    // Get floors for the assigned parking
    const floors = await Floor.find({ parking: req.user.assignedParking }).select('_id');

    // Get slots for those floors
    const floorIds = floors.map(f => f._id);
    const totalSlots = await Slot.countDocuments({ floor: { $in: floorIds } });
    const occupiedSlots = await Slot.countDocuments({ floor: { $in: floorIds }, isOccupied: true });
    const availableSlots = totalSlots - occupiedSlots;
    const totalParkedVehicles = occupiedSlots; // Assuming each occupied slot has a vehicle

    res.json({
      totalParkedVehicles,
      totalSlots,
      availableSlots,
      occupiedSlots
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// GET OWNER/SECURITY DASHBOARD (Owner/Security only)
// --------------------------------------------------
export const getOwnerDashboard = async (req, res) => {
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

    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's bookings
    const todaysBookings = await Booking.find({
      parking: parkingId,
      createdAt: { $gte: today, $lt: tomorrow }
    }).populate('user', 'name').populate('slot', 'slotNumber');

    // Today's earnings
    const todaysEarnings = todaysBookings.reduce((total, booking) => total + booking.totalAmount, 0);

    res.json({
      parking: parking.name,
      todaysBookings,
      todaysEarnings,
      pricing: parking.pricing,
      operationalStatus: parking.operationalStatus,
      temporarilyClosed: parking.temporarilyClosed,
      upiId: parking.upiId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// UPDATE PARKING PRICING (Owner/Admin only)
// --------------------------------------------------
export const updateParkingPricing = async (req, res) => {
  try {
    const { parkingId } = req.params;
    const { pricing } = req.body;

    const parking = await Parking.findById(parkingId);

    if (!parking) return res.status(404).json({ message: 'Parking not found' });

    // Check ownership
    if (req.user.role !== 'ADMIN' && parking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    parking.pricing = { ...parking.pricing, ...pricing };
    await parking.save();

    res.json({ message: 'Pricing updated successfully', pricing: parking.pricing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// TOGGLE PARKING CLOSED STATUS (Owner/Admin only)
// --------------------------------------------------
export const toggleParkingClosed = async (req, res) => {
  try {
    const { parkingId } = req.params;
    const { temporarilyClosed } = req.body;

    const parking = await Parking.findById(parkingId);

    if (!parking) return res.status(404).json({ message: 'Parking not found' });

    // Check ownership
    if (req.user.role !== 'ADMIN' && parking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    parking.temporarilyClosed = temporarilyClosed;
    await parking.save();

    res.json({ message: 'Parking status updated successfully', temporarilyClosed: parking.temporarilyClosed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// UPDATE PARKING UPI ID (Owner/Admin only)
// --------------------------------------------------
export const updateParkingUpiId = async (req, res) => {
  try {
    const { parkingId } = req.params;
    const { upiId } = req.body;

    const parking = await Parking.findById(parkingId);

    if (!parking) return res.status(404).json({ message: 'Parking not found' });

    // Check ownership
    if (req.user.role !== 'ADMIN' && parking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    parking.upiId = upiId;
    await parking.save();

    res.json({ message: 'UPI ID updated successfully', upiId: parking.upiId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
