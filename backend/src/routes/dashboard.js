import express from 'express';
import {
  getDashboard,
  getSecurityDashboard,
  getPublicDashboard,
  getOwnerDashboard,
  updateParkingPricing,
  toggleParkingClosed,
  updateParkingUpiId
} from '../controllers/dashboardController.js';
import { auth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public dashboard (basic stats, no auth required)
router.get('/public', getPublicDashboard);

// Admin-only dashboard
router.get('/', auth, authorizeRoles("ADMIN"), getDashboard);

// Security dashboard
router.get('/security', auth, authorizeRoles("SECURITY"), getSecurityDashboard);

// Owner/Security dashboard
router.get('/owner/:parkingId', auth, getOwnerDashboard);

// Update parking pricing (Owner/Admin)
router.put('/pricing/:parkingId', auth, updateParkingPricing);

// Toggle parking closed status (Owner/Admin)
router.put('/toggle-closed/:parkingId', auth, toggleParkingClosed);

// Update parking UPI ID (Owner/Admin)
router.put('/upi/:parkingId', auth, updateParkingUpiId);

export default router;
