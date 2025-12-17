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
    const floors = await Floor.find();

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

export const getSecurityDashboard = async (req, res) => {
  try {
    const totalSlots = await Slot.countDocuments();
    const occupiedSlots = await Slot.countDocuments({ isOccupied: true });
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
