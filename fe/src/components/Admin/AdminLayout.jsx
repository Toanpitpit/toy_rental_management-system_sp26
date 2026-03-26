import { Container, Navbar, Nav, Dropdown } from 'react-bootstrap';
import { User, LogOut, Bell, Settings } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import useAuth from '../../hooks/useAuth';
import '../../styles/components/AdminLayout.css';

export default function AdminLayout({ children }) {
  const { userProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  return (
    <div className="admin-layout-wrapper">
      <AdminSidebar />
      <div className="admin-main-content">
        <header className="admin-header d-flex align-items-center justify-content-between p-3 bg-white shadow-sm sticky-top">
          <div className="d-flex align-items-center gap-2 text-muted small">
            <span className="fw-bold text-dark">Dự án: ToyRent Management</span> | Vai trò: <span className="text-primary fw-semibold">{userProfile?.role}</span>
          </div>
          <div className="d-flex align-items-center gap-3 ms-auto">
            <button className="btn btn-light btn-sm position-relative">
              <Bell size={18} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: 9 }}>3</span>
            </button>
            <Dropdown align="end">
              <Dropdown.Toggle as="div" className="d-flex align-items-center gap-2 cursor-pointer" id="admin-user-dropdown">
                <img 
                  src={userProfile?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                  alt="avatar" 
                  className="rounded-circle" 
                  style={{ width: 35, height: 35, objectFit: 'cover' }}
                />
                <span className="fw-semibold d-none d-md-inline small">{userProfile?.name || 'User'}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow border-0 mt-3 p-2">
                <Dropdown.Item onClick={() => window.location.href = '/profile'} className="d-flex align-items-center gap-2 p-2 rounded small"><User size={14} /> Profile</Dropdown.Item>
                <Dropdown.Item onClick={() => window.location.href = '/settings'} className="d-flex align-items-center gap-2 p-2 rounded small"><Settings size={14} /> Settings</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={handleLogout} 
                  className="d-flex align-items-center gap-2 p-2 rounded small text-danger"
                >
                  <LogOut size={14} /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>

        <main className="admin-page-content p-4">
          <Container fluid>
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}
