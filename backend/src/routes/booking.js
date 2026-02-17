import express from 'express';
import {
  createBooking,
  getUserBookings,
  cancelBooking,
  getParkingBookings,
  getBookingByTicketId,
} from '../controllers/bookingController.js';
import { auth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All booking routes require authentication
router.use(auth);

// User routes
router.post('/', authorizeRoles('USER'), createBooking);
router.get('/user', authorizeRoles('USER'), getUserBookings);
router.put('/:id/cancel', authorizeRoles('USER'), cancelBooking);

// Admin/Owner/Security routes
router.get('/parking/:parkingId', getParkingBookings);
router.get('/ticket/:ticketId', getBookingByTicketId);

export default router;
