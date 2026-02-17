import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Parking from '../models/Parking.js';
import Floor from '../models/Floor.js';
import Slot from '../models/Slot.js';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import PaymentHistory from '../models/PaymentHistory.js';

const seed = async () => {
  try {
    const mongoUri = 'mongodb+srv://anshullodhi660_db_user:1DRZG3P0vcGyfFJj@cluster0.mqcv3cs.mongodb.net/parking?appName=Cluster0';
    console.log('MONGO_URI:', mongoUri);
    await mongoose.connect(mongoUri);

    // Clear all collections
    await User.deleteMany();
    await Parking.deleteMany();
    await Floor.deleteMany();
    await Slot.deleteMany();
    await Booking.deleteMany();
    await Vehicle.deleteMany();
    await PaymentHistory.deleteMany();

    const hashedPassword = await bcrypt.hash('12345', 10);
    const upiPassword = await bcrypt.hash('upi123', 10); // Set a default UPI password for security
    const admin = new User({ name: 'Admin', email: 'admin@example.com', password: hashedPassword, role: 'ADMIN' });
    const security = new User({ name: 'Security', email: 'security@example.com', password: hashedPassword, role: 'SECURITY', upiPassword });
    const user = new User({ name: 'User', email: 'user@example.com', password: hashedPassword, role: 'USER' });

    await admin.save();
    await security.save();
    await user.save();

    // Create 20 sample parkings with geo-locations across Bangalore
    const parkingsData = [
      {
        name: 'MG Road Central Parking',
        address: '123 MG Road, Bangalore',
        coordinates: [77.5946, 12.9716],
        pricing: { hourlyRate: 5, dailyRate: 50, peakTimeMultiplier: 1.5, peakHours: { start: '08:00', end: '18:00' } },
        amenities: ['CCTV', 'Security', 'EV Charging'],
        assignSecurity: true // Assign security to this parking
      },
      {
        name: 'Indiranagar Plaza Parking',
        address: '456 100 Feet Road, Indiranagar, Bangalore',
        coordinates: [77.6408, 12.9783],
        pricing: { hourlyRate: 4, dailyRate: 40, peakTimeMultiplier: 1.3, peakHours: { start: '09:00', end: '19:00' } }
      },
      {
        name: 'Whitefield IT Park Parking',
        address: '789 ITPL Main Road, Whitefield, Bangalore',
        coordinates: [77.7500, 12.9698],
        pricing: { hourlyRate: 6, dailyRate: 60, peakTimeMultiplier: 1.4, peakHours: { start: '08:00', end: '20:00' } }
      },
      {
        name: 'Koramangala Mall Parking',
        address: '321 80 Feet Road, Koramangala, Bangalore',
        coordinates: [77.6245, 12.9352],
        pricing: { hourlyRate: 5, dailyRate: 45, peakTimeMultiplier: 1.6, peakHours: { start: '10:00', end: '22:00' } }
      },
      {
        name: 'Yelahanka Airbase Parking',
        address: '654 Airport Road, Yelahanka, Bangalore',
        coordinates: [77.5963, 13.1007],
        pricing: { hourlyRate: 3, dailyRate: 35, peakTimeMultiplier: 1.2, peakHours: { start: '06:00', end: '18:00' } }
      },
      {
        name: 'Electronic City Parking',
        address: '987 Infosys Road, Electronic City, Bangalore',
        coordinates: [77.6770, 12.8399],
        pricing: { hourlyRate: 4, dailyRate: 40, peakTimeMultiplier: 1.3, peakHours: { start: '08:00', end: '19:00' } }
      },
      {
        name: 'Jayanagar 4th Block Parking',
        address: '147 30th Cross, Jayanagar 4th Block, Bangalore',
        coordinates: [77.5824, 12.9299],
        pricing: { hourlyRate: 3, dailyRate: 30, peakTimeMultiplier: 1.4, peakHours: { start: '09:00', end: '21:00' } }
      },
      {
        name: 'Rajajinagar Market Parking',
        address: '258 Dr Rajkumar Road, Rajajinagar, Bangalore',
        coordinates: [77.5549, 12.9882],
        pricing: { hourlyRate: 2, dailyRate: 25, peakTimeMultiplier: 1.2, peakHours: { start: '07:00', end: '20:00' } }
      },
      {
        name: 'Malleswaram Complex Parking',
        address: '369 8th Main, Malleswaram, Bangalore',
        coordinates: [77.5703, 13.0221],
        pricing: { hourlyRate: 4, dailyRate: 40, peakTimeMultiplier: 1.3, peakHours: { start: '08:00', end: '19:00' } }
      },
      {
        name: 'Basavanagudi Temple Parking',
        address: '741 Bull Temple Road, Basavanagudi, Bangalore',
        coordinates: [77.5750, 12.9417],
        pricing: { hourlyRate: 3, dailyRate: 35, peakTimeMultiplier: 1.5, peakHours: { start: '06:00', end: '20:00' } }
      },
      {
        name: 'Frazer Town Parking',
        address: '852 Coles Road, Frazer Town, Bangalore',
        coordinates: [77.6155, 12.9982],
        pricing: { hourlyRate: 5, dailyRate: 50, peakTimeMultiplier: 1.4, peakHours: { start: '09:00', end: '18:00' } }
      },
      {
        name: 'Richmond Town Plaza Parking',
        address: '963 Richmond Road, Richmond Town, Bangalore',
        coordinates: [77.6010, 12.9647],
        pricing: { hourlyRate: 6, dailyRate: 55, peakTimeMultiplier: 1.6, peakHours: { start: '10:00', end: '22:00' } }
      },
      {
        name: 'Shivajinagar Bus Stand Parking',
        address: '159 Shivaji Nagar, Bangalore',
        coordinates: [77.6058, 12.9857],
        pricing: { hourlyRate: 2, dailyRate: 20, peakTimeMultiplier: 1.3, peakHours: { start: '05:00', end: '23:00' } }
      },
      {
        name: 'Ulsoor Lake Parking',
        address: '357 Cambridge Road, Ulsoor, Bangalore',
        coordinates: [77.6289, 12.9815],
        pricing: { hourlyRate: 4, dailyRate: 45, peakTimeMultiplier: 1.2, peakHours: { start: '06:00', end: '20:00' } }
      },
      {
        name: 'Sadashivanagar Market Parking',
        address: '468 D Souza Layout, Sadashivanagar, Bangalore',
        coordinates: [77.5801, 13.0068],
        pricing: { hourlyRate: 3, dailyRate: 30, peakTimeMultiplier: 1.4, peakHours: { start: '08:00', end: '19:00' } }
      },
      {
        name: 'Benson Town Parking',
        address: '579 Benson Cross Road, Benson Town, Bangalore',
        coordinates: [77.6041, 12.9949],
        pricing: { hourlyRate: 5, dailyRate: 50, peakTimeMultiplier: 1.5, peakHours: { start: '09:00', end: '18:00' } }
      },
      {
        name: 'RT Nagar Parking',
        address: '681 RT Nagar Main Road, RT Nagar, Bangalore',
        coordinates: [77.5968, 13.0221],
        pricing: { hourlyRate: 4, dailyRate: 40, peakTimeMultiplier: 1.3, peakHours: { start: '07:00', end: '20:00' } }
      },
      {
        name: 'Hebbal Flyover Parking',
        address: '792 Hebbal Main Road, Hebbal, Bangalore',
        coordinates: [77.5919, 13.0382],
        pricing: { hourlyRate: 3, dailyRate: 35, peakTimeMultiplier: 1.2, peakHours: { start: '06:00', end: '22:00' } }
      },
      {
        name: 'Yeshwanthpur Railway Parking',
        address: '813 Yeshwanthpur Railway Station, Bangalore',
        coordinates: [77.5520, 13.0238],
        pricing: { hourlyRate: 2, dailyRate: 25, peakTimeMultiplier: 1.4, peakHours: { start: '04:00', end: '24:00' } }
      },
      {
        name: 'Nagarbhavi Circle Parking',
        address: '924 Outer Ring Road, Nagarbhavi, Bangalore',
        coordinates: [77.5126, 12.9591],
        pricing: { hourlyRate: 3, dailyRate: 30, peakTimeMultiplier: 1.3, peakHours: { start: '08:00', end: '19:00' } }
      },
      {
        name: 'HSR Layout Parking',
        address: '105 HSR Layout Sector 1, Bangalore',
        coordinates: [77.6476, 12.9081],
        pricing: { hourlyRate: 4, dailyRate: 45, peakTimeMultiplier: 1.5, peakHours: { start: '09:00', end: '21:00' } }
      }
    ];

    const savedParkings = [];
    for (let i = 0; i < parkingsData.length; i++) {
      const parkingData = parkingsData[i];
      const parking = new Parking({
        name: parkingData.name,
        address: parkingData.address,
        location: {
          type: 'Point',
          coordinates: parkingData.coordinates, // [longitude, latitude]
        },
        owner: admin._id,
        pricing: parkingData.pricing,
      });
      await parking.save();
      savedParkings.push(parking);
      if (parkingData.assignSecurity) {
        security.assignedParking = parking._id;
        await security.save();
      }
    }

    // Create floors and slots for each parking
    for (const parking of savedParkings) {
      // Create ground floor for each parking
      const groundFloor = new Floor({ name: 'Ground', number: 0, parking: parking._id });
      await groundFloor.save();

      // Create first floor for some parkings (multi-level)
      if (savedParkings.indexOf(parking) % 3 === 0) { // Every 3rd parking gets a first floor
        const firstFloor = new Floor({ name: 'First', number: 1, parking: parking._id });
        await firstFloor.save();

        // Create slots for both floors
        for (let i = 1; i <= 5; i++) {
          await new Slot({ floor: groundFloor._id, slotNumber: i, type: i <= 3 ? 'car' : 'bike' }).save();
          await new Slot({ floor: firstFloor._id, slotNumber: i, type: i <= 3 ? 'car' : 'bike' }).save();
        }
      } else {
        // Create slots for ground floor only
        for (let i = 1; i <= 5; i++) {
          await new Slot({ floor: groundFloor._id, slotNumber: i, type: i <= 3 ? 'car' : 'bike' }).save();
        }
      }
    }

    console.log('Seed data inserted successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seed();
