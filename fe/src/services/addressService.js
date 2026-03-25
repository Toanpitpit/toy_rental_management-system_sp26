import axiosInstance from '../utils/axiosInstance';
import API_ENDPOINTS from '../constants/api';

const getAddresses = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.ADDRESS_ME);
        return response.data;
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }
};

const createAddress = async (addressData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.ADDRESS_ME, addressData);
        return response.data;
    } catch (error) {
        console.error('Error creating address:', error);
        throw error;
    }
};

const updateAddress = async (id, addressData) => {
    try {
        const response = await axiosInstance.put(`${API_ENDPOINTS.ADDRESS_ME}/${id}`, addressData);
        return response.data;
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
};

const deleteAddress = async (id) => {
    try {
        const response = await axiosInstance.delete(`${API_ENDPOINTS.ADDRESS_ME}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting address:', error);
        throw error;
    }
};

const setDefaultAddress = async (id) => {
    try {
        const response = await axiosInstance.patch(`${API_ENDPOINTS.ADDRESS_ME}/${id}/default`);
        return response.data;
    } catch (error) {
        console.error('Error setting default address:', error);
        throw error;
    }
};

export default {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
