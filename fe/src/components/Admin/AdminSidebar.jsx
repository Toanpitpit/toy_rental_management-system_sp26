import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ClipboardCheck, 
  Settings, 
  Users,
  LogOut,
  ChevronRight
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import '../../styles/components/AdminSidebar.css';

export default function AdminSidebar() {
  const { userProfile, logout } = useAuth();
  const isAdmin = userProfile?.role === 'ADMIN';
  const isEmployee = userProfile?.role === 'EMPLOYEE';

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Tổng quan', path: isAdmin ? '/admin' : '/employee' },
    { icon: <Package size={20} />, label: 'Quản lý Đồ chơi', path: '/admin/toys' },
  ];

  if (isEmployee) {
    menuItems.push({ icon: <ShoppingCart size={20} />, label: 'Đơn hàng', path: '/admin/bookings' });
    menuItems.push({ icon: <ClipboardCheck size={20} />, label: 'Kiểm tra (Inspection)', path: '/admin/inspections' });
  }

  if (isAdmin) {
    menuItems.push({ icon: <Settings size={20} />, label: 'Cài đặt hệ thống', path: '/admin/system' });
    menuItems.push({ icon: <Users size={20} />, label: 'Người dùng', path: '/admin/users' });
  }

  return (
    <div className="admin-sidebar shadow-sm">
      <div className="sidebar-brand p-4">
        <div className="d-flex align-items-center gap-2">
          <div className="brand-icon">🧸</div>
          <span className="brand-name fw-bold">ToyRent Admin</span>
        </div>
      </div>

      <Nav className="flex-column px-2">
        {menuItems.map((item, idx) => (
          <NavLink 
            key={idx}
            to={item.path} 
            className={({ isActive }) => `sidebar-link d-flex align-items-center justify-content-between p-3 rounded-3 mb-1 ${isActive ? 'active' : ''}`}
            end={item.path === '/admin' || item.path === '/employee'}
          >
            <div className="d-flex align-items-center gap-3">
              <span className="link-icon">{item.icon}</span>
              <span className="link-label">{item.label}</span>
            </div>
            <ChevronRight size={14} className="link-arrow" />
          </NavLink>
        ))}
      </Nav>

      <div className="sidebar-footer mt-auto p-3">
        <div className="user-info-card p-3 rounded-3 bg-light">
          <div className="d-flex align-items-center gap-2 mb-2">
            <img 
              src={userProfile?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              alt="avatar" 
              className="user-avatar" 
            />
            <div className="overflow-hidden">
              <div className="user-name fw-bold text-truncate">{userProfile?.name || 'Admin'}</div>
              <div className="user-role text-muted small">{userProfile?.role}</div>
            </div>
          </div>
          <button className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2" onClick={logout}>
            <LogOut size={14} /> Thoát Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
