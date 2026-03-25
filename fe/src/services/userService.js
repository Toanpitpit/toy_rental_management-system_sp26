import axiosInstance from '../utils/axiosInstance';
import API_ENDPOINTS from '../constants/api';

const fetchProfile = async () => {
    try {
        const response = await axiosInstance.get(`${API_ENDPOINTS.PROFILE}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return error.response?.data || { success: false, message: error.message };
    }
};

const updateProfile = async (data) => {
    try {
        const response = await axiosInstance.put(`${API_ENDPOINTS.PROFILE}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        return error.response?.data || { success: false, message: error.message };
    }
};

const updateAvatar = async (file) => {
    try {
        const formData = new FormData();
        formData.append('avatar', file);
        
        const response = await axiosInstance.put(API_ENDPOINTS.CHANGE_AVATAR, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating avatar:', error);
        return error.response?.data || { success: false, message: error.message };
    }
};

const changePassword = async (passwords) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.CHANGE_PASSWORD, passwords);
        return response.data;
    } catch (error) {
        console.error('Error changing password:', error);
        return error.response?.data || { success: false, message: error.message };
    }
};

const getUsers = async (params = {}) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.USERS, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        return error.response?.data || { success: false, message: error.message };
    }
};

const updateUserRole = async (id, role) => {
    try {
        const response = await axiosInstance.patch(API_ENDPOINTS.USER_UPDATE_ROLE(id), { role });
        return response.data;
    } catch (error) {
        console.error('Error updating user role:', error);
        return error.response?.data || { success: false, message: error.message };
    }
};

const updateUserStatus = async (id, status) => {
    try {
        const response = await axiosInstance.patch(API_ENDPOINTS.USER_UPDATE_STATUS(id), { status });
        return response.data;
    } catch (error) {
        console.error('Error updating user status:', error);
        return error.response?.data || { success: false, message: error.message };
    }
};

export default {
    fetchProfile,
    updateProfile,
    updateAvatar,
    changePassword,
    getUsers,
    updateUserRole,
    updateUserStatus
};
