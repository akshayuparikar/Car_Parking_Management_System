import Floor from "../models/Floor.js";
import Slot from "../models/Slot.js";
import { authorizeRoles } from "../middleware/auth.js";

// ------------------------------
// Create Floor
// ------------------------------
export const createFloor = async (req, res) => {
  try {
    const { name, number, parking } = req.body;

    let parkingId = parking;

    // For security users, use assigned parking
    if (req.user.role === 'SECURITY') {
      if (!req.user.assignedParking) {
        return res.status(400).json({ message: "Security user not assigned to any parking" });
      }
      parkingId = req.user.assignedParking;
    } else if (!parkingId) {
      return res.status(400).json({ message: "Parking is required" });
    }

    const existing = await Floor.findOne({ parking: parkingId, number });
    if (existing) {
      return res.status(400).json({ message: "Floor number already exists for this parking" });
    }

    const floor = new Floor({ name, number, parking: parkingId });
    await floor.save();

    res.status(201).json(floor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// Get Single Floor by ID
// ------------------------------
export const getFloor = async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.id).populate('parking', 'name');

    if (!floor) {
      return res.status(404).json({ message: 'Floor not found' });
    }

    // If user is authenticated and is a security user, check if floor belongs to assigned parking
    if (req.user && req.user.role === 'SECURITY') {
      if (!req.user.assignedParking) {
        return res.status(400).json({ message: 'Security user not assigned to any parking' });
      }
      if (floor.parking.toString() !== req.user.assignedParking.toString()) {
        return res.status(403).json({ message: 'Access denied: Floor not in assigned parking' });
      }
    }

    res.json(floor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// Get All Floors (Simple)
// ------------------------------
export const getFloors = async (req, res) => {
  try {
    let floors;

    // If user is authenticated and is a security user, filter floors by assigned parking
    if (req.user && req.user.role === 'SECURITY') {
      if (!req.user.assignedParking) {
        return res.status(400).json({ message: 'Security user not assigned to any parking' });
      }
      floors = await Floor.find({ parking: req.user.assignedParking }).populate('parking', 'name');
    } else {
      // For admin or public access, return all floors
      floors = await Floor.find().populate('parking', 'name');
    }

    res.json(floors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// Get Floors with Slot Counts (For Dashboard)
// ------------------------------
export const getFloorSummary = async (req, res) => {
  try {
    const floors = await Floor.find();

    const result = [];

    for (let floor of floors) {
      const totalSlots = await Slot.countDocuments({ floor: floor._id });
      const occupiedSlots = await Slot.countDocuments({
        floor: floor._id,
        isOccupied: true,
      });
      const availableSlots = totalSlots - occupiedSlots;

      result.push({
        floorId: floor._id,
        floorNumber: floor.number,
        totalSlots,
        availableSlots,
        occupiedSlots,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// Get Slots of a Specific Floor
// ------------------------------
export const getSlotsByFloor = async (req, res) => {
  try {
    const { floorId } = req.params;

    const slots = await Slot.find({ floor: floorId }).populate("vehicle", "number");

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// Update Floor
// ------------------------------
export const updateFloor = async (req, res) => {
  try {
    const floor = await Floor.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!floor) return res.status(404).json({ message: "Floor not found" });

    res.json(floor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// Delete Floor
// ------------------------------
export const deleteFloor = async (req, res) => {
  try {
    const floor = await Floor.findByIdAndDelete(req.params.id);

    if (!floor) return res.status(404).json({ message: "Floor not found" });

    res.json({ message: "Floor deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// SECURITY FLOOR OPERATIONS
// ------------------------------
// Create Floor (Security only, scoped to assigned parking)
export const createFloorSecurity = async (req, res) => {
  try {
    const { name, number } = req.body;

    if (!req.user.assignedParking) {
      return res.status(400).json({ message: "Security user not assigned to any parking" });
    }

    const parking = req.user.assignedParking;

    const existing = await Floor.findOne({ parking, number });
    if (existing) {
      return res.status(400).json({ message: "Floor number already exists for this parking" });
    }

    const floor = new Floor({ name, number, parking });
    await floor.save();

    res.status(201).json(floor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Floors (Security only, scoped to assigned parking)
export const getFloorsSecurity = async (req, res) => {
  try {
    if (!req.user.assignedParking) {
      return res.status(400).json({ message: 'Security user not assigned to any parking' });
    }

    const floors = await Floor.find({ parking: req.user.assignedParking }).populate('parking', 'name');
    res.json(floors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Floor (Security only, scoped to assigned parking)
export const updateFloorSecurity = async (req, res) => {
  try {
    if (!req.user.assignedParking) {
      return res.status(400).json({ message: 'Security user not assigned to any parking' });
    }

    const floor = await Floor.findById(req.params.id);

    if (!floor) return res.status(404).json({ message: "Floor not found" });

    if (floor.parking.toString() !== req.user.assignedParking.toString()) {
      return res.status(403).json({ message: "Access denied: Floor not in assigned parking" });
    }

    const updatedFloor = await Floor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedFloor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Floor (Security only, scoped to assigned parking)
export const deleteFloorSecurity = async (req, res) => {
  try {
    if (!req.user.assignedParking) {
      return res.status(400).json({ message: 'Security user not assigned to any parking' });
    }

    const floor = await Floor.findById(req.params.id);

    if (!floor) return res.status(404).json({ message: "Floor not found" });

    if (floor.parking.toString() !== req.user.assignedParking.toString()) {
      return res.status(403).json({ message: "Access denied: Floor not in assigned parking" });
    }

    await Floor.findByIdAndDelete(req.params.id);
    res.json({ message: "Floor deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
