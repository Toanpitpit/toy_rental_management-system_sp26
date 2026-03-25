import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Camera } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from '../../hooks/useAuth';
import "../../styles/pages/profile.css";
import { Header } from '../..//components/Header';
import { Footer } from '../../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const { userProfile, updateProfileWrapper, updateAvatarWrapper, changePasswordWrapper } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('info');

    const [formData, setFormData] = useState({
        name: userProfile?.name || '',
        phone: userProfile?.phoneNumber || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error('Avatar chỉ chấp nhận file: jpg, png, jpeg');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Dung lượng hình ảnh không được vượt quá 5MB');
            return;
        }

        const res = await updateAvatarWrapper(file);
        if (res?.success) {
            toast.success('Cập nhật Avatar thành công!');
        } else {
            toast.error(res?.message || 'Lỗi hệ thống khi cập nhật Avatar');
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const res = await updateProfileWrapper(formData);
        if (res?.success) {
            toast.success('Cập nhật thông tin thành công!');
        } else {
            toast.error(res?.message || 'Có lỗi xảy ra');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            toast.error('Mật khẩu mới không khớp!');
            return;
        }
        const res = await changePasswordWrapper({
            oldPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });

        if (res?.success) {
            toast.success('Đổi mật khẩu thành công!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } else {
            toast.error(res?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <>
            <Header navigate={navigate} />
            <Container className="my-5 profile-container">
                <ToastContainer position="top-right" autoClose={3000} />
                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        <Card className="shadow-sm border-0 rounded-4">
                            <Card.Body className="p-4 p-md-5">
                                <Row className="align-items-center mb-5">
                                    <Col xs="auto" className="position-relative">
                                        <div className="avatar-wrapper">
                                            <img
                                                src={userProfile?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                                alt="Profile"
                                                className="profile-avatar rounded-circle object-fit-cover shadow-sm"
                                            />
                                            <label htmlFor="avatarUpload" className="avatar-overlay text-white rounded-circle d-flex justify-content-center align-items-center">
                                                <Camera size={24} />
                                            </label>
                                        </div>
                                        <input
                                            type="file"
                                            id="avatarUpload"
                                            hidden
                                            accept=".png, .jpg, .jpeg"
                                            onChange={handleAvatarChange}
                                        />
                                    </Col>
                                    <Col>
                                        <h3 className="fw-bold mb-1 text-dark">
                                            {userProfile?.name || userProfile?.email?.split('@')[0] || "User Member"}
                                        </h3>
                                        <p className="text-muted mb-0">{userProfile?.email || "user@toyrent.com"}</p>
                                        <span className={`badge ${userProfile?.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'} mt-2`}>
                                            {userProfile?.status || "UNACTIVE"}
                                        </span>
                                    </Col>
                                </Row>

                                {/* Tabs Navigation */}
                                <ul className="nav nav-tabs mb-4 profile-tabs" role="tablist">
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('info')}
                                        >
                                            Thông tin cá nhân
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('password')}
                                        >
                                            Đổi mật khẩu
                                        </button>
                                    </li>
                                </ul>

                                {/* Tab Content */}
                                <div className="tab-content">
                                    {activeTab === 'info' && (
                                        <div className="tab-pane fade show active">
                                            <Form onSubmit={handleProfileSubmit}>
                                                <Row className="mb-3">
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">Họ và Tên</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Nhập họ và tên"
                                                                className="py-2"
                                                                value={formData.name}
                                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">Số điện thoại</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Nhập số điện thoại"
                                                                className="py-2"
                                                                value={formData.phone}
                                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Row className="mb-4">
                                                    <Col md={12}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">Email</Form.Label>
                                                            <Form.Control
                                                                type="email"
                                                                value={userProfile?.email || ''}
                                                                className="py-2"
                                                                disabled
                                                            />
                                                            <Form.Text className="text-muted">Email không thể thay đổi ở đây.</Form.Text>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Button type="submit" variant="success" className="px-5 py-2 fw-semibold rounded-pill w-100" style={{ background: '#3cb14a', border: 'none' }}>
                                                    Lưu Thay Đổi
                                                </Button>
                                            </Form>
                                        </div>
                                    )}

                                    {activeTab === 'password' && (
                                        <div className="tab-pane fade show active">
                                            <Form onSubmit={handlePasswordSubmit}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">Mật khẩu hiện tại</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        required
                                                        className="py-2"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">Mật khẩu mới</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        required
                                                        className="py-2"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-4">
                                                    <Form.Label className="fw-semibold">Xác nhận mật khẩu mới</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        required
                                                        className="py-2"
                                                        value={passwordData.confirmNewPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                                                    />
                                                </Form.Group>
                                                <Button type="submit" variant="success" className="px-5 py-2 fw-semibold rounded-pill w-100" style={{ background: '#3cb14a', border: 'none' }}>
                                                    Đổi Mật Khẩu
                                                </Button>
                                            </Form>
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </>
    );
}
