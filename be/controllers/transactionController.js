const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');

// POST /api/bookings/:bookingId/transactions
exports.createTransaction = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { amount, type, paymentMethod, description, externalTransactionId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn.' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      bookingId,
      amount,
      type,
      paymentMethod,
      status: paymentMethod === 'cash' ? 'success' : 'pending',
      externalTransactionId,
      description,
    });

    res.status(201).json({ success: true, message: 'Tạo giao dịch thành công!', data: transaction });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/:bookingId/transactions
exports.getTransactionsByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const transactions = await Transaction.find({ bookingId }).sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/transactions/:id/status - Cập nhật trạng thái (dành cho VNPay callback)
exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, externalTransactionId } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { status, ...(externalTransactionId && { externalTransactionId }) },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch.' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};
