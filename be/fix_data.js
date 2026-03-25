const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Toy = require('./models/Toy');
const Booking = require('./models/Booking');
const User = require('./models/User');

async function fixData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for data fixing...');

    // 1. Fix User roles/status to UPPERCASE
    console.log('Standardizing User roles and statuses...');
    await User.updateMany({}, [
      { $set: { 
          role: { $toUpper: "$role" },
          status: { $toUpper: "$status" }
      }}
    ]);

    // 2. Fix Toy statuses to UPPERCASE
    console.log('Standardizing Toy statuses...');
    await Toy.updateMany({}, [
      { $set: { status: { $toUpper: "$status" } } }
    ]);

    // 3. Fix Booking statuses to UPPERCASE
    console.log('Standardizing Booking statuses...');
    await Booking.updateMany({}, [
      { $set: { status: { $toUpper: "$status" } } }
    ]);

    console.log('Data standardization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing data:', error);
    process.exit(1);
  }
}

fixData();
