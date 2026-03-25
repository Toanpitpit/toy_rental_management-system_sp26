import React, { useState } from 'react';
import { Form, Button, Nav, CloseButton, Image } from 'react-bootstrap';
import { Mail, Lock, Eye, EyeOff, Star, Phone, ArrowRight } from 'lucide-react';
import "../../styles/components/auth/auth.css";
import heroImg from "../../assets/image/toyrent_hero.png"
import { FcGoogle } from "react-icons/fc";
import useAuth from '../../hooks/useAuth';

export function Register({ onNavigateToLogin }) {
  const {
    error,
    setError,
    formRegisterData,
    setFormRegisterData,
    validatedRegister,
    setValidatedRegister,
    passwordMatchRegister,
    setPasswordMatchRegister,
    isLoadingRegister,
    showPasswordRegister,
    setShowPasswordRegister,
    showConfirmPasswordRegister,
    setShowConfirmPasswordRegister,
    agreedRegister,
    setAgreedRegister,
    register
  } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormRegisterData(prev => ({ ...prev, [name]: value }));

    if (name === 'confirmPassword' || name === 'password') {
      setPasswordMatchRegister(
        name === 'confirmPassword'
          ? value === formRegisterData.password
          : formRegisterData.confirmPassword === value
      );
    }
  };

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!agreedRegister) {
      setError({ message: 'Please agree to the terms and conditions.' })
      return;
    }
    if (
      !formRegisterData.email || !isEmailValid(formRegisterData.email) ||
      !formRegisterData.phone || !formRegisterData.password ||
      !passwordMatchRegister || !formRegisterData.confirmPassword
    ) {
      setValidatedRegister(true);
      return;
    }

    // call APi register 
    register(formRegisterData.email, formRegisterData.password, formRegisterData.phone);
  };

  return (
    <div className="auth-split-container p-4">
      <div className="auth-split-card">

        <div className="auth-left-panel">
          <div className="auth-left-logo">
            <div className="auth-left-logo-icon">🧸</div>
            <span className="auth-left-logo-text">ToyRent</span>
          </div>

          <h1 className="auth-left-title">Join us today! 🎉🎈</h1>
          <p className="auth-left-subtitle">
            Create an account and start renting amazing toys for your kids.
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
              "Such a great idea! My kids always have new toys to play with."
            </p>
            <span className="auth-left-testimonial-author">— Emily R., Mom of 3</span>
          </div>
        </div>

        {/* ======= RIGHT PANEL ======= */}
        <div className="auth-right-panel">
          <CloseButton className="auth-close-btn" />

          {/* Tabs */}
          <Nav variant="tabs" className="auth-tabs">
            <Nav.Item className="flex-fill">
              <Nav.Link className="auth-tab" onClick={onNavigateToLogin}>Sign In</Nav.Link>
            </Nav.Item>
            <Nav.Item className="flex-fill">
              <Nav.Link className="auth-tab active" active>Create Account</Nav.Link>
            </Nav.Item>
          </Nav>

          <p className="auth-form-subtitle">
            Fill in your details to create a new account.
          </p>

          {/* Google Sign Up */}
          <Button variant="outline-light" className="auth-google-btn" type="button">
            <FcGoogle />
            Sign up with Google
          </Button>

          <div className="auth-divider">
            <span>or fill the form</span>
          </div>

          <Form className="auth-form-enter" onSubmit={handleSubmit} noValidate>
            {error && (
              <Form.Control.Feedback type="invalid" className="auth-input-error" style={{ display: 'block', fontSize: '16px', marginBottom: '10px' }}>
                ⚠ {error?.message}
              </Form.Control.Feedback>
            )}
            <Form.Group className="auth-input-group" controlId="registerEmail">
              <span className="auth-input-icon">
                <Mail size={18} />
              </span>
              <Form.Control
                type="email"
                name="email"
                placeholder="Email address"
                className={`auth-input ${validatedRegister && !isEmailValid(formRegisterData.email) ? 'is-invalid' : ''}`}
                value={formRegisterData.email}
                onChange={handleInputChange}
              />
              {validatedRegister && !isEmailValid(formRegisterData.email) && (
                <Form.Control.Feedback type="invalid" className="auth-input-error" style={{ display: 'block' }}>
                  ⚠ Please enter a valid email
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* Phone */}
            <Form.Group className="auth-input-group" controlId="registerPhone">
              <span className="auth-input-icon">
                <Phone size={18} />
              </span>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="Phone number"
                className={`auth-input ${validatedRegister && !formRegisterData.phone ? 'is-invalid' : ''}`}
                value={formRegisterData.phone}
                onChange={handleInputChange}
              />
              {validatedRegister && !formRegisterData.phone && (
                <Form.Control.Feedback type="invalid" className="auth-input-error" style={{ display: 'block' }}>
                  ⚠ Phone number is required
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* Password */}
            <Form.Group className="auth-input-group" controlId="registerPassword">
              <span className="auth-input-icon">
                <Lock size={18} />
              </span>
              <Form.Control
                type={showPasswordRegister ? 'text' : 'password'}
                name="password"
                placeholder="Create a password"
                className={`auth-input ${validatedRegister && !formRegisterData.password ? 'is-invalid' : ''}`}
                value={formRegisterData.password}
                onChange={handleInputChange}
              />
              <Button
                variant="link"
                className="auth-password-toggle"
                onClick={() => setShowPasswordRegister(!showPasswordRegister)}
                tabIndex={-1}
              >
                {showPasswordRegister ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
              {validatedRegister && !formRegisterData.password && (
                <Form.Control.Feedback type="invalid" className="auth-input-error" style={{ display: 'block' }}>
                  ⚠ Password is required
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* Confirm Password */}
            <Form.Group className="auth-input-group" controlId="registerConfirmPassword">
              <span className="auth-input-icon">
                <Lock size={18} />
              </span>
              <Form.Control
                type={showConfirmPasswordRegister ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm your password"
                className={`auth-input ${validatedRegister && !passwordMatchRegister ? 'is-invalid' : ''}`}
                value={formRegisterData.confirmPassword}
                onChange={handleInputChange}
              />
              <Button
                variant="link"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPasswordRegister(!showConfirmPasswordRegister)}
                tabIndex={-1}
              >
                {showConfirmPasswordRegister ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
              {validatedRegister && !passwordMatchRegister && (
                <Form.Control.Feedback type="invalid" className="auth-input-error" style={{ display: 'block' }}>
                  ⚠ Passwords do not match
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* Agreement */}
            <Form.Check
              type="checkbox"
              id="agreeTerms"
              className="auth-agreement"
              checked={agreedRegister}
              onChange={(e) => setAgreedRegister(e.target.checked)}
              label={
                <span>
                  I agree to the{' '}
                  <a href="#terms">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#privacy">Privacy Policy</a>
                </span>
              }
            />

            {/* Submit */}
            <Button type="submit" className="auth-submit-btn" disabled={isLoadingRegister}>
              {isLoadingRegister ? (
                <>
                  <div className="auth-loading-spinner" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={18} className="auth-submit-btn-arrow" />
                </>
              )}
            </Button>
          </Form>

          {/* Sign In Link */}
          <div className="auth-footer-link">
            Already have an account?{' '}
            <a onClick={onNavigateToLogin} role="button">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
