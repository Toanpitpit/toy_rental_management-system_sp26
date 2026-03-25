import axiosInstance from '../utils/axiosInstance';
import API_ENDPOINTS from '../constants/api';

const getAllToys = async (params = {}) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.TOYS, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching toys:', error);
        throw error;
    }
};

const getToyById = async (id) => {
    try {
        const response = await axiosInstance.get(`${API_ENDPOINTS.TOYS}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching toy detail:', error);
        throw error;
    }
};

const getAllCategories = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.TOY_CATEGORIES);
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

const getToyByCategory = async (category, params = {}) => {
    return getAllToys({ ...params, category });
};

const getToyAvailable = async (params = {}) => {
    return getAllToys({ ...params, status: 'available' });
};

const getToyByStatus = async (status, params = {}) => {
    return getAllToys({ ...params, status });
};

const createToy = async (toyData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.TOYS, toyData);
        return response.data;
    } catch (error) {
        console.error('Error creating toy:', error);
        throw error;
    }
};

const updateToy = async (id, toyData) => {
    try {
        const response = await axiosInstance.put(`${API_ENDPOINTS.TOYS}/${id}`, toyData);
        return response.data;
    } catch (error) {
        console.error('Error updating toy:', error);
        throw error;
    }
};

const updateToyStatus = async (id, status) => {
    try {
        const response = await axiosInstance.patch(`${API_ENDPOINTS.TOYS}/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating toy status:', error);
        throw error;
    }
};

const deleteToy = async (id) => {
    try {
        const response = await axiosInstance.delete(`${API_ENDPOINTS.TOYS}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting toy:', error);
        throw error;
    }
};

const uploadToyImages = async (formData) => {
    try {
        const response = await axiosInstance.post(`${API_ENDPOINTS.TOYS}/upload-images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading toy images:', error);
        throw error;
    }
};

export default {
    getAllToys,
    getToyById,
    getAllCategories,
    getToyByCategory,
    getToyAvailable,
    getToyByStatus,
    createToy,
    updateToy,
    updateToyStatus,
    deleteToy,
    uploadToyImages
};
