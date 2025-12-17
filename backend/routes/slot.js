import express from 'express';
import { createSlot, getSlots, updateSlot, deleteSlot, getSlotsByFloor } from '../controllers/slotController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes for viewer (no auth required)
router.get('/floor/:floorId', getSlotsByFloor); // Public access for parking viewer

// Protected routes for admin
router.post('/', auth, createSlot);
router.get('/', auth, getSlots);
router.put('/:id', auth, updateSlot);
router.delete('/:id', auth, deleteSlot);

export default router;
