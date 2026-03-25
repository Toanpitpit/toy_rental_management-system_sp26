const Inspection = require('../models/Inspection');
const Booking = require('../models/Booking');
const Toy = require('../models/Toy');
const Transaction = require('../models/Transaction');

exports.createInspection = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { type, condition, imageUrl, rentalFee, surcharge, notes, isPaid } = req.body;
    const employeeId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn.' });
    }

    // pickup: Chỉ khi đơn là APPROVED (Đã duyệt nhưng chưa lấy đồ)
    if (type === 'pickup' && booking.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Đơn hàng này chưa sẵn sàng để giao đồ (APPROVED).' });
    }
    // return: Chỉ khi đơn là ACTIVE (Đang thuê)
    if (type === 'return' && booking.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Đơn hàng này chưa được giao (ACTIVE) nên không thể trả.' });
    }

    const inspection = await Inspection.create({
      bookingId,
      employeeId,
      type,
      condition: condition || 'Excellent',
      imageUrl: imageUrl || [],
      rentalFee: rentalFee || booking.totalAmount || 0,
      surcharge: surcharge || 0,
      notes,
    });

    if (type === 'pickup') {
      booking.status = 'ACTIVE';
      booking.employeeId = employeeId;
      
      // Nếu là COD và nhân viên xác nhận đã thu tiền tại chỗ
      if (booking.paymentMethod === 'cod' && isPaid) {
        booking.paymentStatus = 'paid';
        
        // Tạo transaction fare ghi nhận tiền mặt
        await Transaction.create({
           userId: booking.renterId,
           bookingId: booking._id,
           amount: booking.totalAmount, // Phí thuê
           type: 'fare',
           paymentMethod: 'cash',
           status: 'success',
           description: `Thu tiền mặt khi giao đồ chơi: ${booking._id}`
        });
        
        // Thu luôn tiền cọc nếu chưa thu? (Phần cọc thường thu luôn)
        await Transaction.create({
            userId: booking.renterId,
            bookingId: booking._id,
            amount: booking.depositAmount,
            type: 'deposit',
            paymentMethod: 'cash',
            status: 'success',
            description: `Tiền cọc mặt khi giao đồ chơi: ${booking._id}`
         });
      }
      
      await booking.save();
      await Toy.findByIdAndUpdate(booking.toyId, { status: 'RENTED' });
    }

    if (type === 'return') {
      booking.status = 'COMPLETE';
      await booking.save();
      await Toy.findByIdAndUpdate(booking.toyId, { status: 'AVAILABLE' });
      
      // Nếu có phụ phí, tạo transaction penalty
      if (surcharge > 0) {
        await Transaction.create({
           userId: booking.renterId,
           bookingId: booking._id,
           amount: surcharge,
           type: 'penalty',
           paymentMethod: 'cash',
           status: 'success',
           description: `Phụ phí khi trả đồ chơi: ${notes || 'Hỏng hóc/trễ hạn'}`
        });
      }
    }

    const populated = await Inspection.findById(inspection._id)
      .populate('employeeId', 'name email')
      .populate('bookingId');

    res.status(201).json({ success: true, message: `Tạo ${type} inspection thành công!`, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.getAllInspections = async (req, res, next) => {
  try {
    const inspections = await Inspection.find()
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'toyId', select: 'title thumbnail category' },
          { path: 'renterId', select: 'name email phoneNumber' }
        ]
      })
      .populate('employeeId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: inspections });
  } catch (error) {
    next(error);
  }
};

exports.getInspectionsByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const inspections = await Inspection.find({ bookingId })
      .populate('employeeId', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: inspections });
  } catch (error) {
    next(error);
  }
};
