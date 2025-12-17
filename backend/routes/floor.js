import express from 'express';
import { createFloor, getFloors, updateFloor, deleteFloor, getFloorSummary } from '../controllers/floorController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes for viewer (no auth required)
router.get('/', getFloors); // Public access for parking viewer
router.get('/summary', getFloorSummary); // Public access for parking viewer

// Protected routes for admin
router.post('/', auth, createFloor);
router.put('/:id', auth, updateFloor);
router.delete('/:id', auth,  deleteFloor);

export default router;
