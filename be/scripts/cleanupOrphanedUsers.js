const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Booking = require('../models/Booking');
const Inspection = require('../models/Inspection');
const Transaction = require('../models/Transaction');
const Toy = require('../models/Toy');

const cleanupOrphanedData = async () => {
  try {
    // 1. Connect to MongoDB
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in .env');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('>>> Starting orphaned data cleanup... Connected to MongoDB');

    // 2. Fetch all valid user IDs
    const users = await User.find({}, '_id').lean();
    const validUserIds = users.map(u => u._id.toString());
    console.log(`- Found ${validUserIds.length} valid users in the database.`);

    // 3. Identify Bookings with non-existent renterId or employeeId
    const bookings = await Booking.find({}).lean();
    const orphanedBookingIds = [];
    const toysToCheck = [];

    for (const booking of bookings) {
      const isRenterMissing = !validUserIds.includes(booking.renterId.toString());
      const isEmployeeMissing = booking.employeeId && !validUserIds.includes(booking.employeeId.toString());

      if (isRenterMissing || isEmployeeMissing) {
        orphanedBookingIds.push(booking._id);
        if (booking.toyId) toysToCheck.push(booking.toyId.toString());
      }
    }
    console.log(`- Identified ${orphanedBookingIds.length} total bookings with non-existent user references (renter or employee).`);

    // 4. Identify Inspections with non-existent employeeId or non-existent bookingId
    const inspections = await Inspection.find({}).lean();
    const orphanedInspectionIds = [];

    for (const inspection of inspections) {
      const isEmployeeMissing = !validUserIds.includes(inspection.employeeId.toString());
      const isBookingMissing = !orphanedBookingIds.includes(inspection.bookingId) && 
                               !(await Booking.findById(inspection.bookingId));
      
      // If employee is missing OR the booking is newly orphaned OR the booking is already missing
      if (isEmployeeMissing || isBookingMissing || orphanedBookingIds.some(id => id.equals(inspection.bookingId))) {
        orphanedInspectionIds.push(inspection._id);
      }
    }
    console.log(`- Identified ${orphanedInspectionIds.length} inspections with non-existent user or booking references.`);

    // 5. Identify Transactions linked to orphaned bookings
    const transactions = await Transaction.find({
      bookingId: { $in: orphanedBookingIds }
    }).lean();
    const finalTransactionIdsToDelete = transactions.map(t => t._id);

    // --- EXECUTE DELETIONS ---

    if (orphanedInspectionIds.length > 0) {
      const insRes = await Inspection.deleteMany({ _id: { $in: orphanedInspectionIds } });
      console.log(`>>> Removed ${insRes.deletedCount} orphaned inspection records.`);
    }

    if (finalTransactionIdsToDelete.length > 0) {
      const transRes = await Transaction.deleteMany({ _id: { $in: finalTransactionIdsToDelete } });
      console.log(`>>> Removed ${transRes.deletedCount} associated transaction records.`);
    }

    if (orphanedBookingIds.length > 0) {
      const bookRes = await Booking.deleteMany({ _id: { $in: orphanedBookingIds } });
      console.log(`>>> Removed ${bookRes.deletedCount} orphaned booking records.`);
    }

    // --- DATA INTEGRITY: Reset Toy status ---
    let resetCount = 0;
    const uniqueToysToCheck = [...new Set(toysToCheck)];
    for (const toyId of uniqueToysToCheck) {
      const toy = await Toy.findById(toyId);
      if (toy && toy.status === 'PENDING') {
        const remainingBooking = await Booking.findOne({
          toyId: toyId,
          status: { $in: ['PENDING_APPROVED', 'ACTIVE', 'APPROVED', 'WAITING_PAYMENT'] }
        });
        if (!remainingBooking) {
          toy.status = 'AVAILABLE';
          await toy.save();
          resetCount++;
        }
      }
    }
    if (resetCount > 0) {
      console.log(`>>> Reset ${resetCount} toys back to AVAILABLE status.`);
    }

    console.log('\n✅ Cleanup complete. Database is now synchronized with current users.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during orphaned data cleanup:', error);
    process.exit(1);
  }
};

cleanupOrphanedData();
