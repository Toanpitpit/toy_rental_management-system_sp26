import axiosInstance from '../utils/axiosInstance';

const uploadImages = async (files, folder = 'inspections') => {
  try {
    const formData = new FormData();
    if (files instanceof FileList) {
       for (let i = 0; i < files.length; i++) {
         formData.append('images', files[i]);
       }
    } else if (Array.isArray(files)) {
       files.forEach(f => formData.append('images', f));
    } else {
       formData.append('images', files); // Single fallback
    }
    
    formData.append('folder', folder);

    const response = await axiosInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data; // { success: true, data: { urls: [...] } }
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

export default {
  uploadImages,
};
