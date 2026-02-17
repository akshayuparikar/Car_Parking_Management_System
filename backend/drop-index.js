import mongoose from 'mongoose';

const dropOldIndex = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/parking';
  console.log('Connecting to:', mongoUri);
  await mongoose.connect(mongoUri);

  try {
    // Drop the old index on parkings collection
    await mongoose.connection.db.collection('parkings').dropIndex('location_2dsphere');
    console.log('Dropped old index: location_2dsphere');
  } catch (e) {
    console.log('Index not found or already dropped:', e.message);
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

dropOldIndex().catch(console.error);
