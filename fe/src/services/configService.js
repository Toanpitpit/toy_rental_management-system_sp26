import axiosInstance from '../utils/axiosInstance';
import API_ENDPOINTS from '../constants/api';

const getConfigByKey = async (key) => {
    try {
        const response = await axiosInstance.get(`${API_ENDPOINTS.CONFIG}/${key}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching config ${key}:`, error);
        throw error;
    }
};

const updateConfig = async (key, data) => {
    try {
        const response = await axiosInstance.put(`${API_ENDPOINTS.CONFIG}/${key}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating config ${key}:`, error);
        throw error;
    }
};

const getAllConfigs = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.CONFIGS);
        return response.data;
    } catch (error) {
        console.error('Error fetching all configs:', error);
        throw error;
    }
};

export default {
    getConfigByKey,
    updateConfig,
    getAllConfigs
};
