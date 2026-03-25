import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import "../../styles/components/auth/auth.css";

export function VerifyOTP({ onNavigateToLogin }) {
  const location = useLocation();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [backendError, setBackendError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validated, setValidated] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  
  const { verifyOTPWrapper, resetPasswordWrapper, forgotPasswordWrapper, isLoading } = useAuth();
  const otpInputs = useRef([]);

  // Countdown for Resend
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle Paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    
    // Focus last or next empty
    const nextIndex = pastedData.length < 6 ? pastedData.length : 5;
    otpInputs.current[nextIndex]?.focus();
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setBackendError('');
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setBackendError('Vui lòng nhập đủ 6 chữ số');
      return;
    }

    const res = await verifyOTPWrapper(email, otpCode);
    if (res.success) {
      toast.success('Xác thực mã thành công!');
      setIsVerified(true);
      setValidated(false);
    } else {
      setBackendError(res.message || 'Mã OTP không đúng hoặc đã hết hạn');
      toast.error(res.message || 'Mã OTP không đúng hoặc đã hết hạn');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword || password !== confirmPassword) {
      setValidated(true);
      setPasswordMatch(password === confirmPassword);
      return;
    }

    const res = await resetPasswordWrapper(email, otp.join(''), password);
    if (res.success) {
      toast.success('Đổi mật khẩu thành công! Đang chuyển hướng...');
      setTimeout(() => {
        onNavigateToLogin();
      }, 2000);
    } else {
      toast.error(res.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;
    setBackendError('');
    const res = await forgotPasswordWrapper(email);
    if (res.success) {
      toast.success('Mã OTP mới đã được gửi!');
      setResendTimer(60); // Đợi 60s mới cho gửi lại
      setOtp(['', '', '', '', '', '']);
      otpInputs.current[0]?.focus();
    } else {
      setBackendError(res.message || 'Không thể gửi lại mã OTP');
      toast.error(res.message || 'Không thể gửi lại mã OTP');
    }
  };

  return (
    <div className="auth-otp-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', maxWidth: '480px', width: '100%', padding: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f0fdf4', color: '#3cb14a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {isVerified ? <Lock size={30} /> : <ShieldCheck size={30} />}
          </div>
          <h2 style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.5rem', marginBottom: '8px' }}>
            {isVerified ? 'Đặt lại mật khẩu' : 'Xác thực OTP'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {isVerified ? 'Mã xác thực chính xác. Hãy nhập mật khẩu mới của bạn.' : `Chúng tôi đã gửi mã xác thực đến ${email}`}
          </p>
        </div>

        {!isVerified ? (
          <Form onSubmit={handleVerifyOTP}>
            <div style={{ marginBottom: '24px' }}>
              <div 
                className="d-flex justify-content-between gap-2" 
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    style={{
                      width: '50px',
                      height: '60px',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      background: '#fff',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3cb14a'}
                    onBlur={(e) => e.target.style.borderColor = (backendError ? '#dc3545' : '#e2e8f0')}
                  />
                ))}
              </div>
              {backendError && (
                <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '12px', textAlign: 'center', fontWeight: 500 }}>
                   {backendError}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#3cb14a', border: 'none', fontWeight: 600, fontSize: '1rem', marginTop: '10px' }}
            >
              {isLoading ? 'Đang kiểm tra...' : 'Xác thực mã'}
            </Button>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Bạn chưa nhận được mã?</span>{' '}
              <button 
                type="button" 
                onClick={handleResendOTP}
                disabled={resendTimer > 0}
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: resendTimer > 0 ? '#94a3b8' : '#3cb14a', 
                    fontWeight: 600, 
                    fontSize: '0.875rem', 
                    padding: 0, 
                    marginLeft: '4px',
                    cursor: resendTimer > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {resendTimer > 0 ? `Gửi lại sau (${resendTimer}s)` : 'Gửi lại mã'}
              </button>
            </div>
          </Form>
        ) : (
          <Form noValidate validated={validated} onSubmit={handleResetPassword}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#475569' }}>Mật khẩu mới</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu tối thiểu 8 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ borderRadius: '10px', padding: '10px' }}
                  required
                />
                <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} style={{ borderTopRightRadius: '10px', borderBottomRightRadius: '10px' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#475569' }}>Xác nhận mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isInvalid={validated && !passwordMatch}
                style={{ borderRadius: '10px', padding: '10px' }}
                required
              />
              <Form.Control.Feedback type="invalid">Mật khẩu không khớp</Form.Control.Feedback>
            </Form.Group>

            <Button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#3cb14a', border: 'none', fontWeight: 600, fontSize: '1rem' }}
            >
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </Button>
          </Form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={onNavigateToLogin}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
