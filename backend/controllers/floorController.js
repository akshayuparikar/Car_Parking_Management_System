import Floor from "../models/Floor.js";
import Slot from "../models/Slot.js";

// ------------------------------
// Create Floor
// ------------------------------
export const createFloor = async (req, res) => {
  try {
    const { name, number } = req.body;

    const existing = await Floor.findOne({ number });
    if (existing) {
      return res.status(400).json({ message: "Floor number already exists" });
    }

    const floor = new Floor({ name, number });
    await floor.save();

    res.status(201).json(floor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// Get All Floors (Simple)
// ------------------------------
export const getFloors = async (req, res) => {
  try {
    const floors = await Floor.find();
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
