import { useState, useCallback } from 'react';
import bookingService from '../services/bookingService';

export default function useBooking() {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [error, setError] = useState(null);

  const createBooking = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await bookingService.createBooking(data);
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Đặt thuê thất bại.';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookings = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingService.getBookings(params);
      if (res.success) {
        setBookings(res.data);
        setPagination(res.pagination || {});
      } else {
        setError(res.message || 'Không thể tải danh sách đơn hàng.');
      }
    } catch (err) {
      setError('Kết nối máy chủ thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmBooking = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await bookingService.confirmBooking(id);
      return res;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Xác nhận đơn thất bại.');
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectBooking = useCallback(async (id, reason) => {
    setLoading(true);
    try {
      const res = await bookingService.rejectBooking(id, reason);
      return res;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Từ chối đơn thất bại.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    bookings,
    pagination,
    createBooking,
    fetchBookings,
    confirmBooking,
    rejectBooking,
  };
}
