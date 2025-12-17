import express from 'express';
import { addPayment, getPayments } from '../controllers/paymentController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth,  addPayment);
router.get('/', auth, getPayments);

export default router;
