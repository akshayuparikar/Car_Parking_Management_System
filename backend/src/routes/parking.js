import express from 'express';
import {
  createParking,
  getParkings,
  getParkingById,
  updateParking,
  deleteParking,
  getNearbyParkings,
  assignSecurity,
  getParkingDashboard,
} from '../controllers/parkingController.js';
import { auth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getParkings);
router.get('/nearby', getNearbyParkings);
router.get('/:id', getParkingById);

// Protected routes
router.use(auth);

// Admin only
router.post('/', authorizeRoles('ADMIN'), createParking);
router.put('/:id', authorizeRoles('ADMIN'), updateParking);
router.delete('/:id', authorizeRoles('ADMIN'), deleteParking);
router.post('/assign-security', authorizeRoles('ADMIN'), assignSecurity);

// Admin/Owner/Security
router.get('/:parkingId/dashboard', getParkingDashboard);

export default router;
