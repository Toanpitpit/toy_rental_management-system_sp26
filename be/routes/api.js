const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const toyController = require('../controllers/toyController');
const userController = require('../controllers/userController');
const toyDetailController = require('../controllers/toyDetailController');
const bookingController = require('../controllers/bookingController');
const inspectionController = require('../controllers/inspectionController');
const transactionController = require('../controllers/transactionController');
const uploadController = require('../controllers/uploadController');
const statsController = require('../controllers/statsController');
const upload = require('../middleware/uploadMiddleware');

const { protect, authorize, validateRegister } = require('../middleware/authMiddleware');
const {
  checkToyOwnership,
  checkToyOwnershipByToyId,
  requireAuth,
  checkOwnerIdMatch,
} = require('../middleware/toyAuthMiddleware');
const {
  validateToy,
  validateToyDetail,
  validateToyWithDetails,
  validateMongoId,
  validateToyPartialUpdate,
  validateToyStatusUpdate,
  validateToyDetailPartialUpdate,
} = require('../middleware/toyValidation');
const { validateUpdateProfile, validateUpdatePassword } = require('../middleware/userMidleware');

// ==================== AUTH ROUTES ====================
router.post('/auth/login', authController.login);
router.post('/auth/logout', protect, authController.logout);
router.post('/auth/refresh-token', authController.refreshAccessToken);
router.post('/auth/register', validateRegister, authController.createAccount);
router.post('/auth/send-otp', authController.sendOTP);
router.post('/auth/verify-otp', authController.verifyOTP);
router.post('/auth/reset-password', authController.resetPassword);

// ==================== USER ROUTES ====================
router.get('/users/me', protect, userController.getProfile);
router.put('/users/me', protect, validateUpdateProfile, userController.updateProfile);
router.post('/users/me/change_password', protect, validateUpdatePassword, userController.changePassword);
router.put('/users/me/avatar', protect, upload.single('avatar'), userController.updateAvatar);

// Admin User Management
router.get('/users', protect, authorize('ADMIN'), userController.getAllUsers);
router.patch('/users/:id/role', protect, authorize('ADMIN'), userController.updateUserRole);
router.patch('/users/:id/status', protect, authorize('ADMIN'), userController.updateUserStatus);



// ==================== TOY ROUTES ====================
// IMPORTANT: Specific routes before parameterized routes
router.get('/toys/featured', toyController.getFeaturedToys);
router.get('/toys/pending', toyController.getPendingToys);
router.get('/toys/categories/all', toyController.getAllCategories);
router.get('/toys', toyController.getAllToys);
router.get('/toys/:id', validateMongoId, toyController.getToyById);

router.post(
  '/toys/upload-images',
  protect,
  upload.array('images', 5),
  toyController.uploadToyImages
);
router.post('/toys', protect, validateToyWithDetails, checkOwnerIdMatch, toyController.createToy);
router.put('/toys/:id', protect, validateMongoId, checkToyOwnership, validateToyPartialUpdate, toyController.updateToy);
router.patch('/toys/:id/status', protect, validateMongoId, checkToyOwnership, validateToyStatusUpdate, toyController.updateToyStatus);
router.delete('/toys/:id', protect, validateMongoId, checkToyOwnership, toyController.deleteToy);

// ==================== TOY DETAIL ROUTES ====================
router.get('/toy-details', toyDetailController.getAllToyDetails);
router.get('/toys/:toyId/details', validateMongoId, toyDetailController.getToyDetailByToyId);
router.post('/toys/:toyId/details', protect, validateMongoId, checkToyOwnershipByToyId, validateToyDetail, toyDetailController.createToyDetail);
router.put('/toys/:toyId/details', protect, validateMongoId, checkToyOwnershipByToyId, validateToyDetailPartialUpdate, toyDetailController.updateToyDetail);
router.patch('/toys/:toyId/details', protect, validateMongoId, checkToyOwnershipByToyId, validateToyDetailPartialUpdate, toyDetailController.updateToyDetailFields);
router.delete('/toys/:toyId/details', protect, validateMongoId, checkToyOwnershipByToyId, toyDetailController.deleteToyDetail);

// ==================== BOOKING ROUTES ====================
router.post('/bookings', protect, bookingController.createBooking);
router.get('/bookings', protect, bookingController.getBookings);
router.get('/bookings/:id', protect, bookingController.getBookingById);
router.patch('/bookings/:id/confirm', protect, authorize('EMPLOYEE', 'ADMIN'), bookingController.confirmBooking);
router.patch('/bookings/:id/reject', protect, authorize('EMPLOYEE', 'ADMIN'), bookingController.rejectBooking);
router.patch('/bookings/:id/cancel', protect, bookingController.cancelBooking);
router.get('/bookings/:id/payment-url', protect, bookingController.getPaymentUrl);
router.get('/bookings/:id/pay', protect, bookingController.redirectToPayment);
router.get('/vnpay_return', bookingController.vnpayReturn);

// ==================== INSPECTION ROUTES ====================
router.get('/inspections', protect, authorize('EMPLOYEE', 'ADMIN'), inspectionController.getAllInspections);
router.post('/bookings/:bookingId/inspections', protect, authorize('EMPLOYEE', 'ADMIN'), inspectionController.createInspection);
router.get('/bookings/:bookingId/inspections', protect, inspectionController.getInspectionsByBooking);

// ==================== UPLOAD ROUTES ====================
router.post('/upload', protect, upload.array('images', 5), uploadController.uploadImages);

// ==================== TRANSACTION ROUTES ====================
router.post('/bookings/:bookingId/transactions', protect, transactionController.createTransaction);
router.get('/bookings/:bookingId/transactions', protect, transactionController.getTransactionsByBooking);
router.patch('/transactions/:id/status', protect, authorize('EMPLOYEE', 'ADMIN'), transactionController.updateTransactionStatus);



// ==================== STATS ROUTES ====================
router.get('/stats', protect, statsController.getStats);

module.exports = router;
