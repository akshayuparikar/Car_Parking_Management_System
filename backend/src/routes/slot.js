import express from 'express';
import { createSlot, getSlots, updateSlot, deleteSlot, getSlotsByFloor } from '../controllers/slotController.js';
import { auth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public routes for viewer (no auth required)
router.get('/floor/:floorId', getSlotsByFloor); // Public access for parking viewer

// Protected routes for admin and security
router.post('/', auth, authorizeRoles('ADMIN', 'SECURITY'), createSlot);
router.get('/', auth, authorizeRoles('ADMIN', 'SECURITY'), getSlots);
router.put('/:id', auth, authorizeRoles('ADMIN', 'SECURITY'), updateSlot);
router.delete('/:id', auth, authorizeRoles('ADMIN', 'SECURITY'), deleteSlot);

export default router;
