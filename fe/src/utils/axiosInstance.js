import axios from 'axios';
import { getAccessToken } from './common';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:9999/api',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Optional: window.location.href = '/login'; 
            // Avoid forced redirect which might interrupt user flow on public pages
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
