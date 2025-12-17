import express from 'express';
import { auth } from '../middleware/auth.js';
import { parkVehicle, unparkVehicle, getVehicles } from '../controllers/vehicleController.js';

const router = express.Router();

router.get('/', auth, getVehicles);
router.post('/park', auth, parkVehicle);
router.post('/unpark', auth, unparkVehicle);
router.get("/number/:number", async (req, res) => {
  const vehicle = await Vehicle.findOne({ number: req.params.number }).populate("slot");
  if (!vehicle) return res.status(404).json({ message: "Not found" });
  res.json(vehicle);
});

export default router;
