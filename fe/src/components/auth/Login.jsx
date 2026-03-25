import React, { useState } from 'react';
import { Form, Button, Nav, CloseButton, Image } from 'react-bootstrap';
import { Mail, Lock, Eye, EyeOff, Star, ArrowRight } from 'lucide-react';
import "../../styles/components/auth/auth.css";
import heroImg from "../../assets/image/toyrent_hero.png"
import useAuth from '../../hooks/useAuth';
import { FcGoogle } from "react-icons/fc";


export function Login({ onNavigateToRegister, onNavigateToReset }) {

  const [validated, setValidated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { formDataLogin, setFormDataLogin, error, message, login, isLoading } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataLogin(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formDataLogin.email || !formDataLogin.password) {
      setValidated(true);
      return;
    }
    await login(formDataLogin.email, formDataLogin.password);
  };

  return (
    <div className="auth-split-container p-4">
      <div className="auth-split-card">
        <div className="auth-left-panel">
          <div className="auth-left-logo">
            <div className="auth-left-logo-icon">🧸</div>
            <span className="auth-left-logo-text">ToyRent</span>
          </div>

          <h1 className="auth-left-title">Welcome back! 👋✨</h1>
          <p className="auth-left-subtitle">
            Log in to access your rentals, wishlists and exclusive member deals.
          </p>

          <div className="auth-left-image">
            <Image src={heroImg} alt="ToyRent toys" fluid />
          </div>

          <div className="auth-left-testimonial">
            <div className="auth-left-testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#ffd700" color="#ffd700" />
              ))}
            </div>
            <p className="auth-left-testimonial-text">
              "Best toy rental service — my kids love it!"
            </p>
            <span className="auth-left-testimonial-author">— Sarah M., Happy Parent</span>
          </div>
        </div>

        <div className="auth-right-panel">
          <CloseButton className="auth-close-btn" />

          <Nav variant="tabs" className="auth-tabs">
            <Nav.Item className="flex-fill">
              <Nav.Link className="auth-tab active" active>Sign In</Nav.Link>
            </Nav.Item>
            <Nav.Item className="flex-fill">
              <Nav.Link className="auth-tab" onClick={onNavigateToRegister}>Create Account</Nav.Link>
            </Nav.Item>
          </Nav>

          <p className="auth-form-subtitle">
            Sign in with your email and password to continue.
          </p>

          <Button variant="outline-light" className="auth-google-btn" type="button">
            <FcGoogle />
            Sign in with Google
          </Button>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <Form className="auth-form-enter" onSubmit={handleSubmit} noValidate>
            {error && (
              <Form.Control.Feedback type="invalid" className="auth-input-error" style={{ display: 'block', fontSize: '16px', marginBottom: '10px' }}>
                ⚠ {error?.message}
              </Form.Control.Feedback>
            )}
            <Form.Group className="auth-input-group" controlId="loginEmail">
              <span className="auth-input-icon">
                <Mail size={18} />
              </span>
              <Form.Control
                type="email"
                name="email"
                placeholder="Email address"
                className={`auth-input ${validated && !formDataLogin.email ? 'is-invalid' : ''}`}
                value={formDataLogin.email}
                onChange={handleInputChange}
              />
              {validated && !formDataLogin.email && (
                <Form.Control.Feedback type="invalid" className="auth-input-error" style={{ display: 'block' }}>
                  ⚠ Email is required
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="auth-input-group" controlId="loginPassword">
              <span className="auth-input-icon">
                <Lock size={18} />
              </span>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                className={`auth-input ${validated && !formDataLogin.password ? 'is-invalid' : ''}`}
                value={formDataLogin.password}
                onChange={handleInputChange}
              />
              <Button
                variant="link"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>

              {validated && !formDataLogin.password && (
                <Form.Control.Feedback type="invalid" className="auth-input-error" style={{ display: 'block' }}>
                  ⚠ Password is required
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <div className="auth-options-row">
              <Form.Check
                type="checkbox"
                id="rememberMe"
                label="Remember me"
                className="auth-remember-label"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <a className="auth-forgot-link" onClick={onNavigateToReset} role="button">
                Forgot password?
              </a>
            </div>

            <Button onClick={(e) => handleSubmit(e)} className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="auth-loading-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} className="auth-submit-btn-arrow" />
                </>
              )}
            </Button>
          </Form>

          <div className="auth-footer-link">
            Don't have an account?{' '}
            <a onClick={onNavigateToRegister} role="button">Sign up free</a>
          </div>
        </div>
      </div>
    </div>
  );
}
