import axios from 'axios';

const BASE_URL = 'https://provinces.open-api.vn/api';

const getProvinces = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/p/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching provinces:', error);
        return [];
    }
};

const getDistricts = async (provinceCode) => {
    try {
        if (!provinceCode) return [];
        const response = await axios.get(`${BASE_URL}/p/${provinceCode}?depth=2`);
        return response.data.districts;
    } catch (error) {
        console.error('Error fetching districts:', error);
        return [];
    }
};

const getWards = async (districtCode) => {
    try {
        if (!districtCode) return [];
        const response = await axios.get(`${BASE_URL}/d/${districtCode}?depth=2`);
        return response.data.wards;
    } catch (error) {
        console.error('Error fetching wards:', error);
        return [];
    }
};

export default {
    getProvinces,
    getDistricts,
    getWards
};
