const Booking = require('../models/Booking');
const Toy = require('../models/Toy');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const vnpayService = require('../services/vnpayService');

// POST /api/bookings - Khách tạo đơn đặt thuê
exports.createBooking = async (req, res, next) => {
  try {
    const { toyId, startDate, endDate, message, paymentType } = req.body;
    const renterId = req.user._id;

    // Validate toy tồn tại và AVAILABLE
    const toy = await Toy.findById(toyId);
    if (!toy) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đồ chơi.' });
    }
    if (toy.status !== 'AVAILABLE') {
      return res.status(400).json({ success: false, message: 'Đồ chơi này hiện không khả dụng để đặt thuê.' });
    }

    // Validate thời gian
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Ngày không hợp lệ.' });
    }
    if (end - start < 60 * 60 * 1000) {
      return res.status(400).json({ success: false, message: 'Thời gian thuê tối thiểu là 1 giờ.' });
    }
    if (start < new Date()) {
      return res.status(400).json({ success: false, message: 'Thời gian nhận không thể là quá khứ.' });
    }

    // Tính tổng tiền
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    const fareAmount = hours * toy.pricePerHour;
    const depositAmount = toy.depositValue;
    const totalAmount = fareAmount + depositAmount;

    const booking = await Booking.create({
      renterId,
      toyId,
      startDate: start,
      endDate: end,
      message,
      depositAmount,
      totalAmount: fareAmount, // Note: Schema totalAmount is usually fare in this logic
      status: paymentType === 'vnpay' ? 'WAITING_PAYMENT' : 'PENDING_APPROVED',
      paymentMethod: paymentType || 'cod',
    });

    // Chuyển toy → pending
    await Toy.findByIdAndUpdate(toyId, { status: 'PENDING' });

    // Nếu chọn VNPay, tạo Transaction và sinh URL
    if (paymentType === 'vnpay') {
      // Fare Transaction
      await Transaction.create({
        userId: renterId,
        bookingId: booking._id,
        amount: fareAmount,
        type: 'fare',
        paymentMethod: 'vnpay',
        status: 'pending',
        description: `Thanh toán phí thuê cho đồ chơi: ${toy.title}`
      });

      // Deposit Transaction
      await Transaction.create({
        userId: renterId,
        bookingId: booking._id,
        amount: depositAmount,
        type: 'deposit',
        paymentMethod: 'vnpay',
        status: 'pending',
        description: `Tiền cọc cho đồ chơi: ${toy.title}`
      });

      const paymentUrl = vnpayService.createPaymentUrl(req, {
        amount: totalAmount,
        bookingId: booking._id,
        orderInfo: `Thanh toan thue đồ chơi ${toy.title}`,
      });

      return res.status(201).json({
        success: true,
        message: 'Yêu cầu thanh toán đã được khởi tạo.',
        paymentUrl,
        bookingId: booking._id
      });
    }

    const populated = await Booking.findById(booking._id)
      .populate('renterId', 'name email phoneNumber avatar')
      .populate('toyId', 'title thumbnail pricePerHour depositValue category');

    res.status(201).json({ success: true, message: 'Đặt thuê thành công!', data: populated });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings - Lấy danh sách đơn
// - Customer: chỉ thấy đơn của mình
// - Employee/Admin: thấy tất cả, filter theo customerName
exports.getBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const isStaff = ['EMPLOYEE', 'ADMIN'].includes(req.user.role);

    let filter = {};
    if (!isStaff) {
      filter.renterId = req.user._id;
    }
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    // Build aggregation pipeline for advanced sorting and filtering
    let pipeline = [
      { $match: filter },
      // Add a priority field for sorting
      {
        $addFields: {
          priority: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "PENDING_APPROVED"] }, then: 1 },
                { case: { $eq: ["$status", "ACTIVE"] }, then: 2 },
                { case: { $eq: ["$status", "WAITING_PAYMENT"] }, then: 3 }
              ],
              default: 4
            }
          }
        }
      },
      // Sort by priority first, then by date (newest first)
      { $sort: { priority: 1, createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    let bookingsData = await Booking.aggregate(pipeline);

    // Populate the results (manually because aggregate doesn't do it like find)
    let populatedBookings = await Booking.populate(bookingsData, [
      { path: 'renterId', select: 'name email phoneNumber avatar' },
      { path: 'toyId', select: 'title thumbnail pricePerHour category status' },
      { path: 'employeeId', select: 'name email' }
    ]);

    // Filter by search keyword if staff (handle in-memory following previous implementation)
    if (isStaff && search) {
      const keyword = search.toLowerCase();
      populatedBookings = populatedBookings.filter((b) => {
        const renter = b.renterId;
        return (
          renter?.name?.toLowerCase().includes(keyword) ||
          renter?.email?.toLowerCase().includes(keyword) ||
          renter?.phoneNumber?.includes(keyword)
        );
      });
    }

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: populatedBookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('renterId', 'name email phoneNumber avatar')
      .populate('toyId', 'title thumbnail pricePerHour depositValue category')
      .populate('employeeId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn.' });
    }

    // Customer chỉ xem đơn của mình
    const isOwner = booking.renterId._id.equals(req.user._id);
    const isStaff = ['EMPLOYEE', 'ADMIN'].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Không có quyền xem đơn này.' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/bookings/:id/confirm - Employee xác nhận đơn
exports.confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employeeId = req.user._id;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn.' });
    }
    if (booking.status !== 'PENDING_APPROVED') {
      return res.status(400).json({ success: false, message: `Không thể xác nhận đơn có trạng thái: ${booking.status}` });
    }

    // Kiểm tra xem đồ chơi có còn trống không (Lưu ý: khi khách đặt đơn, toy chuyển sang PENDING)
    const toy = await Toy.findById(booking.toyId);
    if (!toy) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đồ chơi liên quan.' });
    }
    
    // Cho phép duyệt nếu toy đang AVAILABLE hoặc PENDING (đang đợi duyệt)
    if (toy.status !== 'AVAILABLE' && toy.status !== 'PENDING') {
      return res.status(400).json({ 
        success: false, 
        message: `Không thể duyệt đơn vì đồ chơi này hiện đang ở trạng thái: ${toy.status}.` 
      });
    }

    // Nguyên tử: Một người duyệt thì toy thành reserved/pending (nhưng ở đây đã được giữ từ create)
    // Cập nhật trạng thái đơn thành APPROVED (Chờ khách đến lấy)
    booking.status = 'APPROVED';
    booking.employeeId = employeeId;
    await booking.save();

    const populated = await Booking.findById(id)
      .populate('renterId', 'name email phoneNumber')
      .populate('toyId', 'title thumbnail')
      .populate('employeeId', 'name email');

    res.json({ success: true, message: 'Xác nhận đơn thành công!', data: populated });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/bookings/:id/reject - Employee từ chối đơn
exports.rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn.' });
    }
    if (!['PENDING_APPROVED', 'WAITING_PAYMENT'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Không thể từ chối đơn có trạng thái: ${booking.status}` });
    }

    booking.status = 'REJECTED';
    booking.rejectionReason = reason || 'Không có lý do cụ thể.';
    booking.employeeId = req.user._id;
    await booking.save();

    // Cập nhật toy → available lại
    // Lưu ý: Nếu toy.status là 'PENDING_APPROVED' thì thực tế nó đang ở trạng thái 'PENDING'
    await Toy.findByIdAndUpdate(booking.toyId, { status: 'AVAILABLE' });

    res.json({ success: true, message: 'Đã từ chối đơn.', data: booking });
  } catch (error) {
    next(error);
  }
};
// PATCH /api/bookings/:id/cancel - Khách tự hủy đơn
exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn.' });
    }

    // Chỉ customer sở hữu đơn mới được hủy, hoặc staff
    const isOwner = booking.renterId.equals(req.user._id);
    const isStaff = ['EMPLOYEE', 'ADMIN'].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Không có quyền hủy đơn này.' });
    }

    // Chỉ cho phép hủy nếu chưa được confirm (active)
    if (!['PENDING_APPROVED', 'WAITING_PAYMENT'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Chỉ có thể hủy đơn khi đơn chưa bắt đầu thuê.' });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    // Mở lại toy
    await Toy.findByIdAndUpdate(booking.toyId, { status: 'AVAILABLE' });

    res.json({ success: true, message: 'Hủy đơn thành công!' });
  } catch (error) {
    next(error);
  }
};

// GET /api/vnpay_return - Xử lý callback từ VNPay
exports.vnpayReturn = async (req, res, next) => {
  try {
    let vnp_Params = req.query;
    const isValid = vnpayService.verifyReturnUrl(vnp_Params);

    if (!isValid) {
      return res.redirect(`${process.env.VNP_RETURN_URL}?status=error&message=Invalid+signature`);
    }

    const responseCode = vnp_Params['vnp_ResponseCode'];
    const txnRef = vnp_Params['vnp_TxnRef']; // bookingId_timestamp
    const bookingId = txnRef.split('_')[0];

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.redirect(`${process.env.VNP_RETURN_URL}?status=error&message=Booking+not+found`);
    }

    if (responseCode === '00') {
      // Thành công
      booking.status = 'APPROVED';
      booking.paymentStatus = 'paid';
      await booking.save();

      // Cập nhật trạng thái transaction
      await Transaction.updateMany(
        { bookingId: booking._id, paymentMethod: 'vnpay' },
        { status: 'success', externalTransactionId: vnp_Params['vnp_TransactionNo'] }
      );

      res.redirect(`${process.env.VNP_RETURN_URL}?status=success&bookingId=${bookingId}`);
    } else {
      // Thất bại
      booking.status = 'CANCELLED';
      booking.paymentStatus = 'failed';
      await booking.save();

      // Mở lại toy
      await Toy.findByIdAndUpdate(booking.toyId, { status: 'AVAILABLE' });

      // Cập nhật trạng thái transaction
      await Transaction.updateMany(
        { bookingId: booking._id, paymentMethod: 'vnpay' },
        { status: 'failed', externalTransactionId: vnp_Params['vnp_TransactionNo'] }
      );

      res.redirect(`${process.env.VNP_RETURN_URL}?status=failed&message=Payment+failed`);
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/:id/payment-url - Lấy URL thanh toán cho đơn đang WAITING_PAYMENT
exports.getPaymentUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn.' });
    }

    if (!booking.renterId.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thanh toán đơn này.' });
    }

    if (booking.status !== 'WAITING_PAYMENT') {
      return res.status(400).json({ success: false, message: 'Đơn hàng này không ở trạng thái chờ thanh toán.' });
    }

    // Tính lại tổng tiền (Fare + Deposit)
    const fareAmount = booking.totalAmount;
    const depositAmount = booking.depositAmount;
    const totalAmount = fareAmount + depositAmount;

    const paymentUrl = vnpayService.createPaymentUrl(req, {
      amount: totalAmount,
      bookingId: booking._id,
      orderInfo: `Thanh toan lai đơn thue đồ chơi #${booking._id.slice(-6).toUpperCase()}`,
    });

    res.json({ success: true, paymentUrl });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/:id/pay - Chuyển hướng trực tiếp sang VNPay
exports.redirectToPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking || !booking.renterId.equals(req.user._id) || booking.status !== 'WAITING_PAYMENT') {
       return res.status(400).send('Đơn hàng không khả dụng để thanh toán lại hoặc bạn không có quyền.');
    }

    const totalAmount = booking.totalAmount + booking.depositAmount;

    const paymentUrl = vnpayService.createPaymentUrl(req, {
      amount: totalAmount,
      bookingId: booking._id,
      orderInfo: `Thanh toan lai đơn thue đồ chơi #${booking._id.slice(-6).toUpperCase()}`,
    });

    res.redirect(paymentUrl);
  } catch (error) {
    next(error);
  }
};
