import { useState } from "react";
import { Navbar, Nav, Container, Button, Form, InputGroup, Dropdown } from "react-bootstrap";
import { Search, User, Menu, X, LogOut, Settings, UserCircle, MapPin } from "lucide-react";
import { navLinks } from "../constants/mockData";
import { isAuthenticated, clearTokens } from "../utils/common";
import useAuth from '../hooks/useAuth';
import "../styles/components/Header.css";

export function Header({ navigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLoginClick = () => navigate && navigate("/login");
  const handleRegisterClick = () => navigate && navigate("/register");
  
  const isLoggedIn = isAuthenticated();
  const { userProfile } = useAuth();
  const currentUser = userProfile || {};

  const handleLogout = () => {
    clearTokens();
    if (navigate) navigate("/");
    window.location.reload(); 
  };

  return (
    <Navbar expand="lg" sticky="top" className="hdr-navbar">
      <Container>
        {/* Logo */}
        <Navbar.Brand href="/" className="hdr-logo-box">
          <div className="hdr-logo-icon">
            <span style={{ fontSize: 18 }}>🧸</span>
          </div>
          <div>
            <div className="hdr-logo-name">ToyRent</div>
            <div className="hdr-logo-tag">Best choice for your kids</div>
          </div>
        </Navbar.Brand>

        {/* Search bar - Desktop */}
        <div className="d-none d-md-flex hdr-search-container">
          <InputGroup className="hdr-search-group">
            <InputGroup.Text className="bg-transparent border-0 ps-3">
              <Search size={18} color="#9ca3af" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search toys to rent... (e.g. LEGO, RC cars)"
              className="hdr-search-input"
            />
            <Button variant="success" className="hdr-search-btn">
              Search
            </Button>
          </InputGroup>
        </div>

        {/* Desktop nav links */}
        <Nav className="d-none d-lg-flex align-items-center gap-2 me-3">
          {navLinks.map((link) => (
            <Nav.Link
              key={link.label}
              href={link.href}
              className="hdr-nav-link"
            >
              {link.label}
            </Nav.Link>
          ))}
        </Nav>

        {/* Auth buttons - Desktop */}
        <div className="d-none d-md-flex align-items-center gap-2 ms-auto">
          {isLoggedIn ? (
            <Dropdown align="end">
              <Dropdown.Toggle id="user-dropdown" className="hdr-user-btn">
                <img 
                  src={currentUser?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                  alt="avatar" 
                  className="hdr-avatar" 
                />
                <span className="hdr-user-name">
                  {currentUser?.name || currentUser?.email?.split('@')[0] || "User"}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="hdr-dropdown-menu">
                {(currentUser?.role === 'ADMIN' || currentUser?.role === 'EMPLOYEE') && (
                  <Dropdown.Item onClick={() => navigate && navigate("/admin")} className="hdr-dropdown-item fw-bold text-success border-bottom mb-2">
                    <Settings size={16} className="text-success" /> Management Mode
                  </Dropdown.Item>
                )}
                <Dropdown.Item onClick={() => navigate && navigate("/bookings")} className="hdr-dropdown-item">
                  <Menu size={16} /> My Bookings
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate && navigate("/address")} className="hdr-dropdown-item">
                  <MapPin size={16} /> Address Settings
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate && navigate("/profile")} className="hdr-dropdown-item">
                  <UserCircle size={16} /> Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="hdr-dropdown-item text-danger">
                  <LogOut size={16} /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <>
              <Button
                variant="outline-secondary"
                className="hdr-btn-login"
                onClick={handleLoginClick}
              >
                <User size={14} /> Login
              </Button>
              <Button
                className="hdr-btn-register"
                onClick={handleRegisterClick}
              >
                Register
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <Button
          variant="light"
          className="d-md-none ms-auto p-1 border-0"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </Button>
      </Container>

      {/* Mobile Menu */}
      {menuOpen && (
        <Container className="d-md-none hdr-mobile-menu">
          <Nav className="flex-column mb-3">
            {navLinks.map((link) => (
              <Nav.Link
                key={link.label}
                href={link.href}
                className="hdr-nav-link py-2 border-bottom"
              >
                {link.label}
              </Nav.Link>
            ))}
          </Nav>
          
          <div className="d-flex flex-column gap-2">
            {isLoggedIn ? (
              <>
                <div className="hdr-mobile-user-card">
                  <img 
                    src={currentUser?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                    alt="avatar" 
                    className="hdr-avatar"
                    style={{ width: 40, height: 40 }}
                  />
                  <div>
                    <div className="fw-bold">{currentUser?.name || "User"}</div>
                    <div className="text-muted small">Logged in</div>
                  </div>
                </div>
                {(currentUser?.role === 'ADMIN' || currentUser?.role === 'EMPLOYEE') && (
                  <Button variant="success" className="text-start d-flex align-items-center gap-2 mb-2 shadow-sm" onClick={() => navigate && navigate("/admin")}>
                    <Settings size={18} /> Management Mode
                  </Button>
                )}
                <Button variant="light" className="text-start d-flex align-items-center gap-2 border mb-2" onClick={() => navigate && navigate("/profile")}>
                  <UserCircle size={18} /> Profile
                </Button>
                <Button variant="outline-danger" className="text-start d-flex align-items-center gap-2" onClick={handleLogout}>
                  <LogOut size={18} /> Logout
                </Button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  className="hdr-btn-login w-50"
                  onClick={handleLoginClick}
                >
                  Login
                </Button>
                <Button
                  className="hdr-btn-register w-50"
                  onClick={handleRegisterClick}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </Container>
      )}
    </Navbar>
  );
}
