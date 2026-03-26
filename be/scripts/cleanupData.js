const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Booking = require('../models/Booking');
const Inspection = require('../models/Inspection');
const Transaction = require('../models/Transaction');
const Toy = require('../models/Toy');

const cleanupData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('>>> Standardizing database... Connected to MongoDB');

    // 1. Define the start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Identify Toys with MISSING images (No thumbnail or empty)
    const invalidToys = await Toy.find({
      $or: [
        { thumbnail: { $exists: false } },
        { thumbnail: "" },
        { thumbnail: null }
      ]
    });
    const invalidToyIds = invalidToys.map(toy => toy._id);
    console.log(`- Found ${invalidToyIds.length} toys with missing thumbnails.`);

    // 3. Identify ALL Bookings for these invalid toys
    const invalidToyBookings = await Booking.find({ toyId: { $in: invalidToyIds } });
    const invalidToyBookingIds = invalidToyBookings.map(b => b._id);

    // 4. Identify OLD Bookings (Created before today)
    const oldBookings = await Booking.find({
      createdAt: { $lt: today }
    });
    const oldBookingIds = oldBookings.map(b => b._id);
    console.log(`- Found ${oldBookingIds.length} legacy bookings created before ${today.toLocaleDateString()}.`);

    // Merge all booking IDs to be purged
    const totalBookingIds = [...new Set([...oldBookingIds, ...invalidToyBookingIds])];

    // --- BEGIN DELETION PROCESS ---

    // A. Delete related Inspections
    const inspectionRes = await Inspection.deleteMany({
      bookingId: { $in: totalBookingIds }
    });
    console.log(`>>> Removed ${inspectionRes.deletedCount} associated inspection records.`);

    // B. Delete related Transactions
    const transactionRes = await Transaction.deleteMany({
      bookingId: { $in: totalBookingIds }
    });
    console.log(`>>> Removed ${transactionRes.deletedCount} associated transaction records.`);

    // C. Delete the Bookings
    const bookingRes = await Booking.deleteMany({
      _id: { $in: totalBookingIds }
    });
    console.log(`>>> Successfully purged ${bookingRes.deletedCount} total bookings.`);

    // D. Delete the Invalid Toys
    const toyRes = await Toy.deleteMany({
      _id: { $in: invalidToyIds }
    });
    console.log(`>>> Successfully purged ${toyRes.deletedCount} toys missing images.`);

    // E. AUTO-RESTORE TOY STATUS: Reset remaining PENDING toys that no longer have a pending booking
    // This handles toys that were stuck in PENDING because their booking was just deleted
    const pendingToys = await Toy.find({ status: 'PENDING' });
    let resetCount = 0;
    
    for (const toy of pendingToys) {
      // Check if there's any valid booking left for this toy (that we didn't just delete)
      const activeBooking = await Booking.findOne({ 
        toyId: toy._id,
        status: { $in: ['PENDING_APPROVED', 'ACTIVE', 'APPROVED'] }
      });
      
      if (!activeBooking) {
        toy.status = 'AVAILABLE';
        await toy.save();
        resetCount++;
      }
    }
    console.log(`>>> Reset ${resetCount} toys back to AVAILABLE status.`);

    console.log('\n✅ Database cleanup finished. The system is now clean and synchronized.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Data cleanup error:', error);
    process.exit(1);
  }
};

cleanupData();
