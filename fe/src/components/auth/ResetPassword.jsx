import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import "../../styles/components/auth/auth.css";

export function ResetPassword({ onNavigateToLogin, onNavigateToOTP }) {
  const [email, setEmail] = useState('');
  const [validated, setValidated] = useState(false);
  const [backendError, setBackendError] = useState('');
  const { forgotPasswordWrapper, isLoading } = useAuth();
  const [otpSent, setOtpSent] = useState(false);

  const isEmailValid = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');

    if (!isEmailValid(email)) {
      setValidated(true);
      return;
    }

    const res = await forgotPasswordWrapper(email);
    if (res.success) {
        toast.success(res.message || 'Mã OTP đã được gửi đến email của bạn');
        setOtpSent(true);
        setTimeout(() => {
          onNavigateToOTP(email);
        }, 1500);
    } else {
        setBackendError(res.message || 'Email này chưa được đăng ký trong hệ thống');
        toast.error(res.message || 'Đã có lỗi xảy ra khi gửi OTP');
    }
  };

  return (
    <div className="auth-reset-container">
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)', maxWidth: '450px', width: '100%', padding: '40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#222', fontWeight: 700, marginBottom: '8px' }}>Reset Password</h2>
          <p style={{ color: '#666', fontSize: '0.875rem' }}>Enter your email to receive a reset link</p>
        </div>

        {/* Info */}
        <div className="auth-reset-info">
          We'll send an OTP code to your email address to verify your identity and reset your password.
        </div>

        {/* Reset Form */}
        <Form className="auth-reset-form" noValidate validated={validated} onSubmit={handleSubmit}>
          {/* Email */}
          <Form.Group controlId="resetEmail">
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter your registered email"
              className={`auth-reset-input ${(validated && !isEmailValid(email)) || backendError ? 'is-invalid' : ''}`}
              value={email}
              onChange={(e) => {
                  setEmail(e.target.value);
                  setBackendError('');
                  setOtpSent(false);
              }}
              required
            />
            {validated && !isEmailValid(email) && (
              <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                Please enter a valid email address
              </Form.Control.Feedback>
            )}
            {backendError && (
              <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                {backendError}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {/* Send OTP Button */}
          <Button
            type="submit"
            className="auth-reset-btn"
            disabled={isLoading || otpSent}
          >
            {otpSent ? 'OTP Sent ✓' : isLoading ? 'Sending...' : 'Send OTP'}
          </Button>
        </Form>

        {/* Back to Login */}
        <div className="auth-reset-back">
          <a onClick={onNavigateToLogin}>← Back to Login</a>
        </div>
      </div>
    </div>
  );
}
