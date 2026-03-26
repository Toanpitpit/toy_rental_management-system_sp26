import axiosInstance from '../utils/axiosInstance';
import API_ENDPOINTS from '../constants/api';

const login = async (email, password) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, {
            email,
            password,
        });
        let data = response.data;
        if (data.success) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
        }
        return data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
}

const register = async (email, password, phoneNumber) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.REGISTER, {
            email,
            password,
            phoneNumber,
        });
        return response.data;
    } catch (error) {
        console.error('Error registering:', error);
        return error
    }
}

const logout = async () => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.LOGOUT, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
}

const sendOTP = async (email) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.SEND_OTP, {
            email,
        });
        return response.data;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
}

const resetPassword = async (email, otp, newPassword) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.RESET_PASSWORD, {
            email,
            otp,
            newPassword,
        });
        return response.data;
    } catch (error) {
        console.error('Error reset password:', error);
        throw error;
    }
}

const verifyOTP = async (email, otp) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.VERIFY_OTP, {
            email,
            otp,
        });
        return response.data;
    } catch (error) {
        console.error('Error verify OTP:', error);
        throw error;
    }
}

const resendOTP = async (email) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.RESEND_OTP, {
            email,
        });
        return response.data;
    } catch (error) {
        console.error('Error resend OTP:', error);
        throw error;
    }
}

const changePassword = async (email, password, newPassword) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.CHANGE_PASSWORD, {
            email,
            password,
            newPassword,
        });
        return response.data;
    } catch (error) {
        console.error('Error change password:', error);
        throw error;
    }
}

const refreshAccessToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axiosInstance.post(API_ENDPOINTS.REFRESH_TOKEN, {
            refreshToken,
        });
        
        const data = response.data;
        if (data.success) {
            localStorage.setItem('accessToken', data.accessToken);
        }
        return data;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
}

const changeEmail = async (email, password, newEmail) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.CHANGE_EMAIL, {
            email,
            password,
            newEmail,
        });
        return response.data;
    } catch (error) {
        console.error('Error change email:', error);
        throw error;
    }
}

export default {
    login,
    register,
    logout,
    sendOTP,
    resetPassword,
    verifyOTP,
    resendOTP,
    changePassword,
    changeEmail,
    refreshAccessToken,
}
