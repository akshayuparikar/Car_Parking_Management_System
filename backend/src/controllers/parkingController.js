import Parking from '../models/Parking.js';
import Floor from '../models/Floor.js';
import Slot from '../models/Slot.js';

// --------------------------------------------------
// CREATE PARKING (Admin only)
// --------------------------------------------------
export const createParking = async (req, res) => {
  try {
    const { name, address, latitude, longitude, pricing } = req.body;

    const parking = new Parking({
      name,
      address,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude], // Note: MongoDB uses [lng, lat]
      },
      owner: req.user._id,
      pricing: pricing || {},
    });

    await parking.save();

    res.status(201).json(parking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// GET ALL PARKINGS (Public for users to search nearby)
// --------------------------------------------------
export const getParkings = async (req, res) => {
  try {
    const parkings = await Parking.find({ status: 'active' })
      .populate('owner', 'name')
      .select('-securityUsers'); // Hide security for public

    res.json(parkings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// GET PARKING BY ID
// --------------------------------------------------
export const getParkingById = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id)
      .populate('owner', 'name')
      .populate('securityUsers', 'name email');

    if (!parking) return res.status(404).json({ message: 'Parking not found' });

    // If user is not admin or owner, hide securityUsers
    if (req.user.role !== 'ADMIN' && parking.owner.toString() !== req.user._id.toString()) {
      parking.securityUsers = undefined;
    }

    res.json(parking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// UPDATE PARKING (Admin or Owner only)
// --------------------------------------------------
export const updateParking = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);

    if (!parking) return res.status(404).json({ message: 'Parking not found' });

    // Check ownership
    if (req.user.role !== 'ADMIN' && parking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedParking = await Parking.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json(updatedParking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// DELETE PARKING (Admin only)
// --------------------------------------------------
export const deleteParking = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);

    if (!parking) return res.status(404).json({ message: 'Parking not found' });

    // Only admin can delete
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Parking.findByIdAndDelete(req.params.id);

    res.json({ message: 'Parking deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// GET NEARBY PARKINGS (Geo-spatial query with sorting)
// --------------------------------------------------
export const getNearbyParkings = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // radius in meters

    const parkings = await Parking.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
      status: 'active',
    }).populate('owner', 'name');

    // Calculate distance and available slots for each parking
    const parkingsWithDetails = await Promise.all(
      parkings.map(async (parking) => {
        // Calculate distance
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          parking.location.coordinates[1], // lat
          parking.location.coordinates[0]  // lng
        );

        // Get available slots
        const floors = await Floor.find({ parking: parking._id });
        const slots = await Slot.find({ floor: { $in: floors.map(f => f._id) } });
        const availableSlots = slots.filter(s => !s.isOccupied).length;

        // Determine status
        let operationalStatus = 'open';
        if (parking.temporarilyClosed) {
          operationalStatus = 'closed';
        } else if (availableSlots === 0) {
          operationalStatus = 'full';
        }

        return {
          ...parking.toObject(),
          distance: Math.round(distance * 10) / 10, // round to 1 decimal
          availableSlots,
          operationalStatus,
        };
      })
    );

    // Sort by: nearest distance, highest availability, lowest price
    parkingsWithDetails.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.availableSlots !== b.availableSlots) return b.availableSlots - a.availableSlots;
      return a.pricing.hourlyRate - b.pricing.hourlyRate;
    });

    res.json(parkingsWithDetails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function to calculate distance between two points
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

import User from '../models/User.js';

// --------------------------------------------------
// ASSIGN SECURITY TO PARKING (Admin only)
// --------------------------------------------------
export const assignSecurity = async (req, res) => {
  try {
    const { parkingId, securityId } = req.body;

    const parking = await Parking.findById(parkingId);
    if (!parking) return res.status(404).json({ message: 'Parking not found' });

    const security = await User.findById(securityId);
    if (!security || security.role !== 'SECURITY') {
      return res.status(404).json({ message: 'Security user not found' });
    }

    // Only admin can assign security users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: Only admins can assign security users' });
    }

    // Check if parking already has a security assigned
    const existingSecurity = await User.findOne({ assignedParking: parkingId, role: 'SECURITY' });
    if (existingSecurity && existingSecurity._id.toString() !== securityId) {
      return res.status(400).json({ message: 'Parking already has a security assigned. Remove existing assignment first.' });
    }

    // Check if security is already assigned to another parking
    if (security.assignedParking && security.assignedParking.toString() !== parkingId) {
      return res.status(400).json({ message: 'Security is already assigned to another parking. Remove existing assignment first.' });
    }

    // Assign parking to security
    security.assignedParking = parkingId;
    await security.save();

    // Add security to parking's securityUsers array
    parking.securityUsers.push(securityId);
    await parking.save();

    res.json({ message: 'Security assigned successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// GET PARKING DASHBOARD (Admin/Owner/Security)
// --------------------------------------------------
export const getParkingDashboard = async (req, res) => {
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

    // Get floors and slots for this parking
    const floors = await Floor.find({ parking: parkingId }).populate('parking', 'name');
    const slots = await Slot.find({ floor: { $in: floors.map(f => f._id) } })
      .populate('floor', 'number')
      .populate('vehicle', 'number type');

    const totalSlots = slots.length;
    const occupiedSlots = slots.filter(s => s.isOccupied).length;
    const availableSlots = totalSlots - occupiedSlots;

    res.json({
      parking: parking.name,
      totalSlots,
      occupiedSlots,
      availableSlots,
      floors: floors.length,
      slots,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
