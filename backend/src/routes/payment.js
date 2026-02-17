import express from 'express';
import { addPayment, getPayments, processPreBookingPayment } from '../controllers/paymentController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, addPayment);
router.get('/', auth, getPayments);
router.post('/pre-booking', auth, processPreBookingPayment);

export default router;
