import express from 'express';
import { auth, authorizeRoles } from '../middleware/auth.js';
import {
  createFloorSecurity,
  getFloorsSecurity,
  updateFloorSecurity,
  deleteFloorSecurity
} from '../controllers/floorController.js';
import {
  createSlotSecurity,
  getSlotsSecurity,
  updateSlotSecurity,
  deleteSlotSecurity
} from '../controllers/slotController.js';

const router = express.Router();

// All security routes require authentication and SECURITY role
router.use(auth);
router.use(authorizeRoles('SECURITY'));

// Floor routes for security
router.post('/floors', createFloorSecurity);
router.get('/floors', getFloorsSecurity);
router.put('/floors/:id', updateFloorSecurity);
router.delete('/floors/:id', deleteFloorSecurity);

// Slot routes for security
router.post('/slots', createSlotSecurity);
router.get('/slots', getSlotsSecurity);
router.put('/slots/:id', updateSlotSecurity);
router.delete('/slots/:id', deleteSlotSecurity);

export default router;
