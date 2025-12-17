import Slot from "../models/Slot.js";
import Floor from "../models/Floor.js";
import Vehicle from "../models/Vehicle.js";

// --------------------------------------------------
// CREATE SLOT
// --------------------------------------------------
export const createSlot = async (req, res) => {
  try {
    const { floor, slotNumber } = req.body;

    // Check floor exists
    const floorExists = await Floor.findById(floor);
    if (!floorExists) {
      return res.status(400).json({ message: "Floor does not exist" });
    }

    // Ensure slot number is unique per floor
    const existingSlot = await Slot.findOne({ floor, slotNumber });
    if (existingSlot) {
      return res.status(400).json({ message: "Slot number already exists on this floor" });
    }

    const slot = new Slot({ floor, slotNumber });
    await slot.save();

    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// GET ALL SLOTS (admin level)
// --------------------------------------------------
export const getSlots = async (req, res) => {
  try {
    const slots = await Slot.find()
      .populate("floor", "number")
      .populate("vehicle", "number");

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
