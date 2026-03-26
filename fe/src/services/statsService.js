import axiosInstance from '../utils/axiosInstance';

const statsService = {
  getDashboardStats: async () => {
    try {
      const response = await axiosInstance.get('/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default statsService;
