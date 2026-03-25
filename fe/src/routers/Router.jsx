import { Login, Register, ResetPassword, VerifyOTP } from "../components/auth";
import HomePage from "../pages/PublicPage/HomePage";
import ProfilePage from "../pages/PublicPage/ProfilePage";
import AddressPage from "../pages/PublicPage/AddressPage";
import ListToy from "../pages/PublicPage/ListToy";
import ToyDetail from "../pages/PublicPage/ToyDetail";
import BookingsPage from "../pages/PublicPage/BookingsPage";
import AdminDashboard from "../pages/AdminPage/AdminDashboard";
import ManageToys from "../pages/AdminPage/ManageToys";
import ManageBookings from "../pages/AdminPage/ManageBookings";
import ManageInspections from "../pages/AdminPage/ManageInspections";
import ManageUsers from "../pages/AdminPage/ManageUsers";
import AdminSystemPage from "../pages/AdminPage/AdminSystemPage";
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AppRoutes() {
  const navigate = useNavigate();
  return (
    <AuthProvider>
      <AppRoutesInternal navigate={navigate} />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

function AppRoutesInternal({ navigate }) {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/toys" element={<ListToy />} />
      <Route path="/toys/:id" element={<ToyDetail />} />
      <Route path="/bookings" element={<BookingsPage />} />
      <Route path="/payment-callback" element={<BookingsPage />} />

      {/* User */}
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/address" element={<AddressPage />} />

      {/* Auth */}
      <Route
        path="/login"
        element={
          <Login
            onNavigateToRegister={() => navigate('/register')}
            onNavigateToReset={() => navigate('/reset-password')}
          />
        }
      />
      <Route
        path="/register"
        element={
          <Register
            onNavigateToLogin={() => navigate('/login')}
          />
        }
      />
      <Route
        path="/reset-password"
        element={
          <ResetPassword
            onNavigateToLogin={() => navigate('/login')}
            onNavigateToOTP={(email) => navigate('/verify-otp', { state: { email } })}
          />
        }
      />
      <Route
        path="/verify-otp"
        element={
          <VerifyOTP
            onNavigateToLogin={() => navigate('/login')}
          />
        }
      />

      {/* Admin/Employee Management */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/toys" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <ManageToys />
        </ProtectedRoute>
      } />
      <Route path="/admin/bookings" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <ManageBookings />
        </ProtectedRoute>
      } />
      <Route path="/admin/inspections" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <ManageInspections />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ManageUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/system" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminSystemPage />
        </ProtectedRoute>
      } />

      {/* Legacy redirects / Role entry points */}
      <Route path="/employee" element={
         <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <AdminDashboard />
         </ProtectedRoute>
      } />
    </Routes>
  );
}