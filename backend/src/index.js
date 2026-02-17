import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import parkingRoutes from './routes/parking.js';
import bookingRoutes from './routes/booking.js';
import floorRoutes from './routes/floor.js';
import slotRoutes from './routes/slot.js';
import vehicleRoutes from './routes/vehicle.js';
import paymentRoutes from './routes/payment.js';
import userRoutes from './routes/user.js';
import dashboardRoutes from './routes/dashboard.js';
import securityRoutes from './routes/security.js';

dotenv.config();
connectDB();

// Global error handlers to prevent backend crashes
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't exit, just log to keep server running
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

const app = express();

// Full CORS setup to allow preflight requests
app.use(cors({
  origin: 'http://localhost:3000', // React frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/parkings', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/security', securityRoutes);

app.get('/', (req, res) => res.send('Parking Management Backend Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
