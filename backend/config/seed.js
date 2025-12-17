import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

import User from '../models/User.js';
import Floor from '../models/Floor.js';
import Slot from '../models/Slot.js';

const seed = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/parking';
  console.log('MONGO_URI:', mongoUri);
  await mongoose.connect(mongoUri);

  await User.deleteMany();
  await Floor.deleteMany();
  await Slot.deleteMany();

const admin = new User({ name: 'Admin', email: 'admin@example.com', password: '12345', role: 'ADMIN' });
const security = new User({ name: 'Security', email: 'security@example.com', password: '12345', role: 'SECURITY' });
const user = new User({ name: 'User', email: 'user@example.com', password: '12345', role: 'USER' });

  await admin.save();
  await security.save();
  await user.save();

  const floor1 = new Floor({ name: 'Ground', number: 0 });
  const floor2 = new Floor({ name: 'First', number: 1 });

  await floor1.save();
  await floor2.save();

  for (let i = 1; i <= 5; i++) {
    await new Slot({ floor: floor1._id, slotNumber: i }).save();
    await new Slot({ floor: floor2._id, slotNumber: i }).save();
  }

  console.log('Seed data inserted successfully');
  process.exit();
};

seed();
