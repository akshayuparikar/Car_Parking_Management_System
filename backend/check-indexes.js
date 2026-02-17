import mongoose from 'mongoose';

const checkIndexes = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/parking';
  console.log('Connecting to:', mongoUri);
  await mongoose.connect(mongoUri);

  try {
    const indexes = await mongoose.connection.db.collection('parkings').indexes();
    console.log('Indexes on parkings collection:');
    indexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });
  } catch (e) {
    console.log('Error checking indexes:', e.message);
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

checkIndexes().catch(console.error);
