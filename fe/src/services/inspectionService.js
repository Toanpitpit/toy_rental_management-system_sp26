import axiosInstance from '../utils/axiosInstance';
import API_ENDPOINTS from '../constants/api';

const createInspection = async (bookingId, inspectionData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.INSPECTIONS(bookingId), inspectionData);
    return response.data;
  } catch (error) {
    console.error('Error creating inspection:', error);
    throw error;
  }
};

const getInspections = async (bookingId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.INSPECTIONS(bookingId));
    return response.data;
  } catch (error) {
    console.error('Error fetching inspections:', error);
    throw error;
  }
};

const getAllInspections = async () => {
  try {
    const response = await axiosInstance.get('/inspections');
    return response.data;
  } catch (error) {
    console.error('Error fetching all inspections:', error);
    throw error;
  }
};

export default {
  createInspection,
  getInspections,
  getAllInspections,
};
