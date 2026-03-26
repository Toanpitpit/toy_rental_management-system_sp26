import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import { getCurrentUser } from '../utils/common';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userProfile, setUserProfile] = useState(getCurrentUser());
    
    // Auth States
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [data, setData] = useState(null);
    const [formDataLogin, setFormDataLogin] = useState({ email: '', password: '' });
    const [validated, setValidated] = useState(false);

    // Register States
    const [formRegisterData, setFormRegisterData] = useState({
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [validatedRegister, setValidatedRegister] = useState(false);
    const [passwordMatchRegister, setPasswordMatchRegister] = useState(true);
    const [isLoadingRegister, setIsLoadingRegister] = useState(false);
    const [showPasswordRegister, setShowPasswordRegister] = useState(false);
    const [showConfirmPasswordRegister, setShowConfirmPasswordRegister] = useState(false);
    const [agreedRegister, setAgreedRegister] = useState(false);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
                setMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const login = async (email, password) => {
        try {
            console.log('Logging in with:', email, password);
            setIsLoading(true);
            const response = await authService.login(email, password);
            if (!response.success) {
                setError(response.error);
                setMessage(response.message);
                setData(null);
            } else {
                setMessage(response.message);
                const userData = response.data;
                setData(userData);
                
                // Immediately set profile from login data to satisfy ProtectedRoute
                setUserProfile(userData);
                
                // Fetch full profile and await it
                await getProfile();
                
                const role = userData?.role;
                console.log('User Role detected for navigation:', role);

                // Navigate based on role
                if (role === 'ADMIN' || role === 'EMPLOYEE') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            const serverError = error.response?.data;
            setError(serverError?.error || { message: error.message });
            setMessage(serverError?.error?.message || error.message);
            setData(null);
        }
    };

    const register = async (email, password, phone) => {
        try {
            setIsLoadingRegister(true);
            const response = await authService.register(email, password, phone);

            if (response && response.response) { 
                const serverError = response.response.data;
                setError(serverError?.error || { message: response.message });
                setMessage(serverError?.error?.message || response.message);
                setData(null);
            } else if (response && !response.success) {
                setError(response.error);
                setData(null);
            } else {
                setMessage(response.message);
                setData(response.data);
                setFormRegisterData({ email: '', phone: '', password: '', confirmPassword: '' });
            }
            setIsLoadingRegister(false);
            navigate('/login');
        } catch (error) {
            setIsLoadingRegister(false);
            setError({ message: "Server Error Please Try Again Later" });
        }
    };

    // ======= PROFILE METHODS =======
    const getProfile = async () => {
        try {
            const res = await userService.fetchProfile();
            if (res.success) {
                setUserProfile(res.data);
            } else {
                setUserProfile(null);
            }
            return res;
        } catch (error) {
            setUserProfile(null);
            return { success: false, message: error.message };
        }
    };

    const updateProfileWrapper = async (profileData) => {
        const res = await userService.updateProfile(profileData);
        if (res.success) {
            setUserProfile(res.data);
        }
        return res;
    };

    const updateAvatarWrapper = async (file) => {
        const res = await userService.updateAvatar(file);
        if (res.success) {
            setUserProfile(res.data);
        }
        return res;
    };

    const changePasswordWrapper = async (passwords) => {
        return await userService.changePassword(passwords);
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout API failed:', err);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUserProfile(null);
            navigate('/');
        }
    };

    useEffect(() => {
        const user = getCurrentUser();
        const token = localStorage.getItem('accessToken');
        if (user && token) {
            getProfile();
        } else {
            setUserProfile(null);
        }
    }, []); // Only run once on mount, or when status clearly changes

    const value = {
        formDataLogin, setFormDataLogin,
        formRegisterData, setFormRegisterData,
        isLoading, setIsLoading,
        validated, setValidated,
        validatedRegister, setValidatedRegister,
        passwordMatchRegister, setPasswordMatchRegister,
        isLoadingRegister, setIsLoadingRegister,
        showPasswordRegister, setShowPasswordRegister,
        showConfirmPasswordRegister, setShowConfirmPasswordRegister,
        agreedRegister, setAgreedRegister,
        error, setError,
        message, data,
        login, register, logout,
        userProfile, getProfile,
        updateProfileWrapper, updateAvatarWrapper, changePasswordWrapper,
        forgotPasswordWrapper: async (email) => {
            setIsLoading(true);
            try {
                const res = await authService.sendOTP(email);
                setIsLoading(false);
                return res;
            } catch (err) {
                setIsLoading(false);
                return err.response?.data || { success: false, message: err.message };
            }
        },
        verifyOTPWrapper: async (email, otp) => {
            setIsLoading(true);
            try {
                const res = await authService.verifyOTP(email, otp);
                setIsLoading(false);
                return res;
            } catch (err) {
                setIsLoading(false);
                return err.response?.data || { success: false, message: err.message };
            }
        },
        resetPasswordWrapper: async (email, otp, newPassword) => {
            setIsLoading(true);
            try {
                const res = await authService.resetPassword(email, otp, newPassword);
                setIsLoading(false);
                return res;
            } catch (err) {
                setIsLoading(false);
                return err.response?.data || { success: false, message: err.message };
            }
        }
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default function useAuth() {
    return useContext(AuthContext);
}
