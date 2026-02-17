import express from 'express';
import { createFloor, getFloors, getFloor, updateFloor, deleteFloor, getFloorSummary } from '../controllers/floorController.js';
import { auth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Routes with optional auth (for security user filtering)
router.get('/', auth, getFloors); // Requires auth to filter by security user assignments
router.get('/:id', auth, getFloor); // Get single floor by ID
router.get('/summary', getFloorSummary); // Public access for parking viewer

// Protected routes for admin and security
router.post('/', auth, createFloor);
router.put('/:id', auth, authorizeRoles('ADMIN'), updateFloor);
router.delete('/:id', auth, authorizeRoles('ADMIN'), deleteFloor);

export default router;
