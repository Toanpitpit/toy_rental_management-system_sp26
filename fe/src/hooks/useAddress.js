import { useState, useCallback, useEffect } from 'react';
import addressService from '../services/addressService';
import provinceService from '../services/provinceService';
import { toast } from 'react-toastify';

const useAddress = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const initialFormData = {
        receiverName: '',
        receiverPhone: '',
        province: '',
        district: '',
        ward: '',
        detail: '',
        isDefault: false
    };
    const [formData, setFormData] = useState(initialFormData);

    const fetchAddresses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await addressService.getAddresses();
            if (res.success) {
                const sortedData = [...res.data].sort((a, b) => {
                    if (a.isDefault) return -1;
                    if (b.isDefault) return 1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                setAddresses(sortedData);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
        const loadProvinces = async () => {
            const data = await provinceService.getProvinces();
            setProvinces(data);
        };
        loadProvinces();
    }, [fetchAddresses]);

    useEffect(() => {
        const loadDistricts = async () => {
            if (formData.province) {
                const selectedProv = provinces.find(p => p.name === formData.province);
                if (selectedProv) {
                    const data = await provinceService.getDistricts(selectedProv.code);
                    setDistricts(data);
                }
            } else {
                setDistricts([]);
            }
            setWards([]);
        };
        loadDistricts();
    }, [formData.province, provinces]);

    useEffect(() => {
        const loadWards = async () => {
            if (formData.district) {
                const selectedDist = districts.find(d => d.name === formData.district);
                if (selectedDist) {
                    const data = await provinceService.getWards(selectedDist.code);
                    setWards(data);
                }
            } else {
                setWards([]);
            }
        };
        loadWards();
    }, [formData.district, districts]);

    const handleSetDefault = async (id) => {
        try {
            setAddresses(prev => {
                const updated = prev.map(addr => ({
                    ...addr,
                    isDefault: addr._id === id
                }));
                return [...updated].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
            });

            const res = await addressService.setDefaultAddress(id);
            if (res.success) {
                toast.success('Đã đặt làm mặc định');
                fetchAddresses();
            }
        } catch (error) {
            toast.error('Lỗi khi thiết lập mặc định');
            fetchAddresses();
        }
    };

    const handleDelete = async () => {
        if (!selectedAddress) return;
        setIsSubmitting(true);
        try {
            const res = await addressService.deleteAddress(selectedAddress._id);
            if (res.success) {
                toast.success('Đã xóa địa chỉ');
                setShowDeleteModal(false);
                fetchAddresses();
            }
        } catch (error) {
            toast.error('Lỗi khi xóa địa chỉ');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let res;
            if (editMode && selectedAddress) {
                res = await addressService.updateAddress(selectedAddress._id, formData);
            } else {
                res = await addressService.createAddress(formData);
            }

            if (res.success) {
                toast.success(editMode ? 'Cập nhật thành công' : 'Thêm địa chỉ thành công');
                setShowModal(false);
                setFormData(initialFormData);
                fetchAddresses();
            } else {
                toast.error(res.message || 'Lỗi xử lý');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi kết nối');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        addresses,
        loading,
        fetchAddresses,
        handleSetDefault,
        handleDelete,
        setShowModal,
        setEditMode,
        setSelectedAddress,
        showModal,
        showDeleteModal,
        setShowDeleteModal,
        editMode,
        selectedAddress,
        initialFormData,
        formData,
        setFormData,
        provinces,
        districts,
        wards,
        isSubmitting,
        handleSubmit
    };
};

export default useAddress;
