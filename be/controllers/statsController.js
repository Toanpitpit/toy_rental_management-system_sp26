const Booking = require('../models/Booking');
const Toy = require('../models/Toy');

exports.getStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    // Based on user request "trang nhân viên vẫn hiện đầy đủ các toy , đơn hàng cần duyệt"
    // We will allow Employees to see the global stats for Toys and Bookings
    // but we can still keep some internal filtering if needed for other specific modules.
    
    let toyFilter = {};
    let bookingFilter = {};

    // If we want to strictly follow "Show everything for Admin and Employee"
    // we keep filters empty.
    
    // Quick Stats Calculation
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const approvedStatuses = ['APPROVED', 'ACTIVE', 'COMPLETE', 'WAITING_PAYMENT', 'WAITING_REFUND'];

    const [
      totalToys,
      pendingBookings,
      totalBookings,
      confirmedToday,
      confirmedMonth,
      confirmedYear,
      totalRevenue
    ] = await Promise.all([
      Toy.countDocuments(toyFilter),
      Booking.countDocuments({ ...bookingFilter, status: 'PENDING_APPROVED' }),
      Booking.countDocuments(bookingFilter),
      Booking.countDocuments({ 
        ...bookingFilter, 
        status: { $in: approvedStatuses },
        createdAt: { $gte: startOfToday }
      }),
      Booking.countDocuments({ 
        ...bookingFilter, 
        status: { $in: approvedStatuses },
        createdAt: { $gte: startOfMonth }
      }),
      Booking.countDocuments({ 
        ...bookingFilter, 
        status: { $in: approvedStatuses },
        createdAt: { $gte: startOfYear }
      }),
      Booking.aggregate([
        { $match: { ...bookingFilter, status: 'COMPLETE' } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ]);

    const revenueAmount = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Last 7 days distribution
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyBookings = await Booking.aggregate([
      {
        $match: {
          ...bookingFilter,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ["$status", "COMPLETE"] }, "$totalAmount", 0] } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        quickStats: {
          totalToys,
          pendingBookings,
          totalBookings,
          confirmedToday,
          confirmedMonth,
          confirmedYear,
          totalRevenue: revenueAmount
        },
        dailyBookings
      }
    });
  } catch (error) {
    next(error);
  }
};
