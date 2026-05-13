const mongoose = require('mongoose');
require('dotenv').config();

async function clearData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear Users and Pickups
    const collections = ['users', 'pickups'];
    for (const colName of collections) {
      await mongoose.connection.collection(colName).deleteMany({});
      console.log(`Cleared collection: ${colName}`);
    }

    console.log('Successfully cleared all dummy data.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
}

clearData();
