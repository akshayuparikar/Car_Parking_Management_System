import express from 'express';
import { getDashboard, getSecurityDashboard } from '../controllers/dashboardController.js';
import { auth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Admin-only dashboard
router.get('/', auth, authorizeRoles("ADMIN"), getDashboard);

// Security dashboard
router.get('/security', auth, authorizeRoles("SECURITY"), getSecurityDashboard);

export default router;
