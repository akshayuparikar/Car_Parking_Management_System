import express from 'express';
import { auth, authorizeRoles } from '../middleware/auth.js';
import { parkVehicle, calculateExitAmount, getVehicles, getOccupiedSlotsForSecurity, processExitPayment, unparkVehicleByNumber } from '../controllers/vehicleController.js';
import Vehicle from '../models/Vehicle.js';

const router = express.Router();

router.get('/', auth, getVehicles);
router.post('/park', auth, authorizeRoles('ADMIN', 'SECURITY'), parkVehicle);
router.post('/unpark', auth, calculateExitAmount); // Changed to calculate amount without exiting
router.post('/unpark/number', auth, authorizeRoles('SECURITY'), unparkVehicleByNumber);
router.get("/number/:number", auth, async (req, res) => {
  const vehicle = await Vehicle.findOne({ number: req.params.number, exitTime: null }).populate({
    path: 'slot',
    populate: { path: 'floor', populate: { path: 'parking' } }
  });
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found! Please check the number and try again." });

  // For security users, ensure the vehicle belongs to their assigned parking
  if (req.user.role === 'SECURITY') {
    if (!req.user.assignedParking) {
      return res.status(400).json({ message: 'Security user not assigned to any parking' });
    }
    if (vehicle.slot.floor.parking._id.toString() !== req.user.assignedParking.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Vehicle not in assigned parking' });
    }
  }

  res.json(vehicle);
});

// Security routes
router.get('/security/exit', auth, getOccupiedSlotsForSecurity);
router.post('/security/exit/:vehicleId', auth, authorizeRoles('SECURITY'), processExitPayment);

export default router;
