import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import toyService from '../services/toyService';

const LIMIT = 12;

export default function useToys() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [toys, setToys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: LIMIT });

  // Đọc state từ URL — đảm bảo reload không mất bộ lọc
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Cập nhật URL params, luôn reset về page 1 khi đổi filter
  const setFilters = useCallback(
    (newFilters) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newFilters.search !== undefined) {
          newFilters.search ? next.set('search', newFilters.search) : next.delete('search');
        }
        if (newFilters.category !== undefined) {
          newFilters.category ? next.set('category', newFilters.category) : next.delete('category');
        }
        if (newFilters.status !== undefined) {
          newFilters.status ? next.set('status', newFilters.status) : next.delete('status');
        }
        next.set('page', '1'); // luôn reset page khi đổi filter
        return next;
      });
    },
    [setSearchParams]
  );

  const setPage = useCallback(
    (p) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(p));
        return next;
      });
    },
    [setSearchParams]
  );

  const fetchToys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;

      const res = await toyService.getAllToys(params);
      if (res.success) {
        setToys(res.data);
        setPagination(res.pagination);
      } else {
        setError(res.message || 'Không thể tải danh sách đồ chơi.');
      }
    } catch (err) {
      setError('Kết nối máy chủ thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [search, category, status, page]);

  useEffect(() => {
    fetchToys();
  }, [fetchToys]);

  // Đếm số bộ lọc đang active
  const activeFilterCount = useMemo(
    () => [search, category, status].filter(Boolean).length,
    [search, category, status]
  );

  const clearFilters = useCallback(() => {
    setSearchParams({ page: '1' });
  }, [setSearchParams]);

  return {
    toys,
    loading,
    error,
    pagination,
    search,
    category,
    status,
    page,
    setFilters,
    setPage,
    activeFilterCount,
    clearFilters,
    refetch: fetchToys,
  };
}
