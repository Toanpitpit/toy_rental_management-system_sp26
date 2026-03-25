import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userProfile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Nếu chưa đăng nhập
  if (!userProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu không đủ quyền
  if (allowedRoles && !allowedRoles.includes(userProfile.role?.toUpperCase())) {
    // Nếu là admin/employee nhưng vào sai trang thì về dashboard chính của họ
    if (['ADMIN', 'EMPLOYEE'].includes(userProfile.role?.toUpperCase())) {
        return <Navigate to="/admin" replace />;
    }
    // Ngược lại về home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
