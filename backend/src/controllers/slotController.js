import Slot from "../models/Slot.js";
import Floor from "../models/Floor.js";
import Vehicle from "../models/Vehicle.js";
import { authorizeRoles } from "../middleware/auth.js";

// --------------------------------------------------
// CREATE SLOT (Admin/Owner/Security for their parking)
// --------------------------------------------------
export const createSlot = async (req, res) => {
  try {
    const { floor, numSlots, type } = req.body;
    const parsedNumSlots = parseInt(numSlots, 10);

    if (isNaN(parsedNumSlots) || parsedNumSlots <= 0) {
      return res.status(400).json({ message: 'Number of slots must be a positive integer' });
    }

    // Check floor exists and get parking
    const floorExists = await Floor.findById(floor).populate('parking');
    if (!floorExists) {
      return res.status(400).json({ message: "Floor does not exist" });
    }

    // Check access to parking
    const parking = floorExists.parking;
    const isOwner = parking.owner.toString() === req.user._id.toString();
    const isSecurity = parking.securityUsers.includes(req.user._id) || req.user.role === 'SECURITY';
    const isAdmin = req.user.role === 'ADMIN';

    if (!isAdmin && !isOwner && !isSecurity) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // For security users, ensure the floor belongs to their assigned parking
    if (req.user.role === 'SECURITY') {
      if (!req.user.assignedParking) {
        return res.status(400).json({ message: 'Security user not assigned to any parking' });
      }
      if (parking._id.toString() !== req.user.assignedParking.toString()) {
        return res.status(403).json({ message: 'Access denied: Floor not in assigned parking' });
      }
    }

    // Find the highest slot number on this floor
    const highestSlot = await Slot.findOne({ floor }).sort({ slotNumber: -1 });
    let startSlotNumber = highestSlot ? highestSlot.slotNumber + 1 : 1;

    const createdSlots = [];
    for (let i = 0; i < parsedNumSlots; i++) {
      const slotNumber = startSlotNumber + i;
      // Double-check uniqueness (though unlikely)
      const existingSlot = await Slot.findOne({ floor, slotNumber });
      if (existingSlot) {
        return res.status(400).json({ message: `Slot number ${slotNumber} already exists on this floor` });
      }

      const slot = new Slot({ floor, slotNumber, type });
      await slot.save();
      createdSlots.push(slot);
    }

    res.status(201).json({ message: `${parsedNumSlots} slots created successfully`, slots: createdSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// GET ALL SLOTS (admin level or security scoped)
// --------------------------------------------------
export const getSlots = async (req, res) => {
  try {
    let slots;

    if (req.user.role === 'SECURITY') {
      if (!req.user.assignedParking) {
        return res.status(400).json({ message: 'Security user not assigned to any parking' });
      }

      // Get floors for assigned parking
      const floors = await Floor.find({ parking: req.user.assignedParking });

      // Get slots for those floors
      slots = await Slot.find({ floor: { $in: floors.map(f => f._id) } })
        .populate("floor", "number")
        .populate("vehicle", "number");
    } else {
      // Admin gets all slots
      slots = await Slot.find()
        .populate("floor", "number")
        .populate("vehicle", "number");
    }

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// GET SLOTS BY FLOOR (for UI grid)
// --------------------------------------------------
export const getSlotsByFloor = async (req, res) => {
  try {
    const { floorId } = req.params;

    const slots = await Slot.find({ floor: floorId })
      .populate("vehicle", "number");

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// ASSIGN SLOT TO VEHICLE
// --------------------------------------------------
export const assignSlot = async (req, res) => {
  try {
    const { vehicleId, slotId } = req.body;

    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (slot.isOccupied)
      return res.status(400).json({ message: "Slot is already occupied" });

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    // Check if this vehicle is already parked
    if (vehicle.slot)
      return res.status(400).json({ message: "Vehicle is already parked in a slot" });

    // Assign slot
    slot.isOccupied = true;
    slot.vehicle = vehicle._id;
    await slot.save();

    // Update vehicle
    vehicle.slot = slot._id;
    vehicle.entryTime = new Date();
    await vehicle.save();

    res.json({ message: "Slot assigned successfully", slot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// RELEASE SLOT (vehicle exiting)
// --------------------------------------------------
export const releaseSlot = async (req, res) => {
  try {
    const { slotId } = req.body;

    const slot = await Slot.findById(slotId).populate("vehicle");
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (!slot.isOccupied)
      return res.status(400).json({ message: "Slot is already empty" });

    const vehicle = await Vehicle.findById(slot.vehicle._id);

    // Clear slot
    slot.isOccupied = false;
    slot.vehicle = null;
    await slot.save();

    // Clear vehicle data
    vehicle.slot = null;
    vehicle.exitTime = new Date();
    await vehicle.save();

    res.json({ message: "Slot released successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// UPDATE SLOT
// --------------------------------------------------
export const updateSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// DELETE SLOT
// --------------------------------------------------
export const deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    res.json({ message: "Slot deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// SECURITY SLOT OPERATIONS
// --------------------------------------------------
// Create Slot (Security only, scoped to assigned parking)
export const createSlotSecurity = async (req, res) => {
  try {
    const { floor, numSlots, type } = req.body;
    const parsedNumSlots = parseInt(numSlots, 10);

    if (isNaN(parsedNumSlots) || parsedNumSlots <= 0) {
      return res.status(400).json({ message: 'Number of slots must be a positive integer' });
    }

    if (!req.user.assignedParking) {
      return res.status(400).json({ message: "Security user not assigned to any parking" });
    }

    // Check floor exists and belongs to assigned parking
    const floorExists = await Floor.findById(floor).populate('parking');
    if (!floorExists) {
      return res.status(400).json({ message: "Floor does not exist" });
    }

    if (floorExists.parking._id.toString() !== req.user.assignedParking.toString()) {
      return res.status(403).json({ message: "Access denied: Floor not in assigned parking" });
    }

    // Find the highest slot number on this floor
    const highestSlot = await Slot.findOne({ floor }).sort({ slotNumber: -1 });
    let startSlotNumber = highestSlot ? highestSlot.slotNumber + 1 : 1;

    const createdSlots = [];
    for (let i = 0; i < parsedNumSlots; i++) {
      const slotNumber = startSlotNumber + i;
      // Double-check uniqueness (though unlikely)
      const existingSlot = await Slot.findOne({ floor, slotNumber });
      if (existingSlot) {
        return res.status(400).json({ message: `Slot number ${slotNumber} already exists on this floor` });
      }

      const slot = new Slot({ floor, slotNumber, type });
      await slot.save();
      createdSlots.push(slot);
    }

    res.status(201).json({ message: `${parsedNumSlots} slots created successfully`, slots: createdSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Slots (Security only, scoped to assigned parking)
export const getSlotsSecurity = async (req, res) => {
  try {
    if (!req.user.assignedParking) {
      return res.status(400).json({ message: 'Security user not assigned to any parking' });
    }

    // Get floors for assigned parking
    const floors = await Floor.find({ parking: req.user.assignedParking });

    // Get slots for those floors
    const slots = await Slot.find({ floor: { $in: floors.map(f => f._id) } })
      .populate("floor", "number")
      .populate("vehicle", "number");

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Slot (Security only, scoped to assigned parking)
export const updateSlotSecurity = async (req, res) => {
  try {
    if (!req.user.assignedParking) {
      return res.status(400).json({ message: 'Security user not assigned to any parking' });
    }

    const slot = await Slot.findById(req.params.id).populate({
      path: 'floor',
      populate: { path: 'parking' }
    });

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (slot.floor.parking._id.toString() !== req.user.assignedParking.toString()) {
      return res.status(403).json({ message: "Access denied: Slot not in assigned parking" });
    }

    const updatedSlot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSlot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Slot (Security only, scoped to assigned parking)
export const deleteSlotSecurity = async (req, res) => {
  try {
    if (!req.user.assignedParking) {
      return res.status(400).json({ message: 'Security user not assigned to any parking' });
    }

    const slot = await Slot.findById(req.params.id).populate({
      path: 'floor',
      populate: { path: 'parking' }
    });

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (slot.floor.parking._id.toString() !== req.user.assignedParking.toString()) {
      return res.status(403).json({ message: "Access denied: Slot not in assigned parking" });
    }

    await Slot.findByIdAndDelete(req.params.id);
    res.json({ message: "Slot deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
