import axiosInstance from '../utils/axiosInstance';
import API_ENDPOINTS from '../constants/api';

const createBooking = async (bookingData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.BOOKINGS, bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

const getBookings = async (params = {}) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.BOOKINGS, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

const getBookingById = async (id) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.BOOKING_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

const confirmBooking = async (id) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.BOOKING_CONFIRM(id));
    return response.data;
  } catch (error) {
    console.error('Error confirming booking:', error);
    throw error;
  }
};

const rejectBooking = async (id, reason) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.BOOKING_REJECT(id), { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting booking:', error);
    throw error;
  }
};

const cancelBooking = async (id) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.BOOKING_CANCEL(id));
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

const getPaymentUrl = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_ENDPOINTS.BOOKINGS}/${id}/payment-url`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment url:', error);
    throw error;
  }
};

export default {
  createBooking,
  getBookings,
  getBookingById,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  getPaymentUrl,
};
