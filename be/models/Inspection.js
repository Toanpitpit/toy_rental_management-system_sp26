const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['pickup', 'return'],
      required: true,
    },
    imageUrl: [{ type: String }],
    condition: {
      type: String,
      enum: ['New', 'Excellent', 'Good', 'Fair', 'Broken'],
      default: 'Excellent',
    },
    rentalFee: {
      type: Number,
      default: 0,
    },
    surcharge: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inspection', inspectionSchema);
