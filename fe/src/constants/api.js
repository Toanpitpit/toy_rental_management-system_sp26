export const API_BASE_URL = 'http://localhost:9999/api';

const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  RESEND_OTP: '/auth/resend-otp',
  RESET_PASSWORD: '/auth/reset-password',

  // User
  PROFILE: '/users/me',
  CHANGE_PASSWORD: '/users/me/change_password',
  CHANGE_AVATAR: '/users/me/avatar',
  USERS: '/users',
  USER_UPDATE_ROLE: (id) => `/users/${id}/role`,
  USER_UPDATE_STATUS: (id) => `/users/${id}/status`,

  // Address
  ADDRESS_ME: '/address/me',
  ADDRESS_BY_ID: (id) => `/address/me/${id}`,
  ADDRESS_SET_DEFAULT: (id) => `/address/me/${id}/default`,

  // Toys
  TOYS: '/toys',
  TOY_BY_ID: (id) => `/toys/${id}`,
  TOY_FEATURED: '/toys/featured',
  TOY_PENDING: '/toys/pending',
  TOY_CATEGORIES: '/toys/categories/all',
  TOY_STATUS: (id) => `/toys/${id}/status`,
  TOY_UPLOAD_IMAGES: '/toys/upload-images',

  // Toy Details
  TOY_DETAILS: (toyId) => `/toys/${toyId}/details`,

  // Bookings
  BOOKINGS: '/bookings',
  BOOKING_BY_ID: (id) => `/bookings/${id}`,
  BOOKING_CONFIRM: (id) => `/bookings/${id}/confirm`,
  BOOKING_REJECT: (id) => `/bookings/${id}/reject`,
  BOOKING_CANCEL: (id) => `/bookings/${id}/cancel`,

  // Inspections
  INSPECTIONS: (bookingId) => `/bookings/${bookingId}/inspections`,

  // Transactions
  TRANSACTIONS: (bookingId) => `/bookings/${bookingId}/transactions`,
  TRANSACTION_STATUS: (id) => `/transactions/${id}/status`,

  // Legacy
  CONFIG: '/config',
  CONFIGS: '/configs',
};

export default API_ENDPOINTS;
