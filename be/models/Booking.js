const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Toy',
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        'PENDING_APPROVED', 
        'WAITING_PAYMENT', 
        'APPROVED', 
        'REJECTED', 
        'ACTIVE', 
        'WAITING_REFUND', 
        'COMPLETE', 
        'CANCELLED'
      ],
      default: 'PENDING_APPROVED',
    },
    depositAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'vnpay'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
