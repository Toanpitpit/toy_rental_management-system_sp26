
/**
 * Validate email format
 * @param {string} email
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, message: 'Email không được để trống' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: 'Email không đúng định dạng (vd: example@gmail.com)' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate password strength
 * - Tối thiểu 8 ký tự
 * - Có ít nhất 1 chữ hoa
 * - Có ít nhất 1 chữ thường
 * - Có ít nhất 1 số
 * - Có ít nhất 1 ký tự đặc biệt
 * @param {string} password
 * @returns {{ isValid: boolean, message: string, strength: 'weak' | 'medium' | 'strong' }}
 */


export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { isValid: false, message: 'Mật khẩu không được để trống', strength: 'weak' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự', strength: 'weak' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const checks = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar];
  const passedChecks = checks.filter(Boolean).length;

  if (passedChecks <= 2) {
    const missing = [];
    if (!hasUpperCase) missing.push('chữ hoa');
    if (!hasLowerCase) missing.push('chữ thường');
    if (!hasNumber) missing.push('số');
    if (!hasSpecialChar) missing.push('ký tự đặc biệt');
    return {
      isValid: false,
      message: `Mật khẩu cần thêm: ${missing.join(', ')}`,
      strength: 'weak',
    };
  }

  if (passedChecks === 3) {
    return { isValid: true, message: 'Mật khẩu trung bình', strength: 'medium' };
  }

  return { isValid: true, message: 'Mật khẩu mạnh', strength: 'strong' };
};

/**
 * Validate confirm password matches
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, message: 'Xác nhận mật khẩu không được để trống' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Mật khẩu xác nhận không khớp' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate Vietnamese phone number
 * Supports: 03x, 05x, 07x, 08x, 09x (10 digits)
 * @param {string} phone
 * @returns {{ isValid: boolean, message: string }}
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, message: 'Số điện thoại không được để trống' };
  }

  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

  if (!phoneRegex.test(phone.trim())) {
    return { isValid: false, message: 'Số điện thoại không hợp lệ (vd: 0912345678)' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate a required field (not empty)
 * @param {string} value
 * @param {string} fieldName - Tên field để hiện message
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateRequired = (value, fieldName = 'Trường này') => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return { isValid: false, message: `${fieldName} không được để trống` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate name (min 2 chars, no special characters)
 * @param {string} name
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { isValid: false, message: 'Tên không được để trống' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, message: 'Tên phải có ít nhất 2 ký tự' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, message: 'Tên không được quá 50 ký tự' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate OTP (6 digits)
 * @param {string} otp
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateOTP = (otp) => {
  if (!otp || otp.trim() === '') {
    return { isValid: false, message: 'Mã OTP không được để trống' };
  }

  const otpRegex = /^\d{6}$/;

  if (!otpRegex.test(otp.trim())) {
    return { isValid: false, message: 'Mã OTP phải gồm 6 chữ số' };
  }

  return { isValid: true, message: '' };
};

// ===========================
// FORM VALIDATION HELPERS
// ===========================

/**
 * Validate toàn bộ form Login
 * @param {{ email: string, password: string }} values
 * @returns {{ isValid: boolean, errors: object }}
 */
export const validateLoginForm = (values) => {
  const errors = {};

  const emailResult = validateEmail(values.email);
  if (!emailResult.isValid) errors.email = emailResult.message;

  const passwordRequired = validateRequired(values.password, 'Mật khẩu');
  if (!passwordRequired.isValid) errors.password = passwordRequired.message;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate toàn bộ form Register
 * @param {{ email: string, password: string, confirmPassword: string, phone: string, name?: string }} values
 * @returns {{ isValid: boolean, errors: object }}
 */
export const validateRegisterForm = (values) => {
  const errors = {};

  const emailResult = validateEmail(values.email);
  if (!emailResult.isValid) errors.email = emailResult.message;

  const passwordResult = validatePassword(values.password);
  if (!passwordResult.isValid) errors.password = passwordResult.message;

  if (values.confirmPassword !== undefined) {
    const confirmResult = validateConfirmPassword(values.password, values.confirmPassword);
    if (!confirmResult.isValid) errors.confirmPassword = confirmResult.message;
  }

  const phoneResult = validatePhone(values.phone);
  if (!phoneResult.isValid) errors.phone = phoneResult.message;

  if (values.name !== undefined && values.name !== '') {
    const nameResult = validateName(values.name);
    if (!nameResult.isValid) errors.name = nameResult.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate form đổi mật khẩu
 * @param {{ password: string, newPassword: string, confirmNewPassword: string }} values
 * @returns {{ isValid: boolean, errors: object }}
 */
export const validateChangePasswordForm = (values) => {
  const errors = {};

  const currentPwResult = validateRequired(values.password, 'Mật khẩu hiện tại');
  if (!currentPwResult.isValid) errors.password = currentPwResult.message;

  const newPwResult = validatePassword(values.newPassword);
  if (!newPwResult.isValid) errors.newPassword = newPwResult.message;

  const confirmResult = validateConfirmPassword(values.newPassword, values.confirmNewPassword);
  if (!confirmResult.isValid) errors.confirmNewPassword = confirmResult.message;

  if (values.password && values.newPassword && values.password === values.newPassword) {
    errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ===========================
// FORMAT / HELPER UTILITIES
// ===========================

/**
 * Format số điện thoại: 0912345678 → 091 234 5678
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
};

/**
 * Format ngày tháng từ ISO string → dd/MM/yyyy
 * @param {string | Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format ngày giờ từ ISO string → dd/MM/yyyy HH:mm
 * @param {string | Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format tiền VNĐ: 1500000 → "1.500.000₫"
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Truncate text và thêm "..." nếu dài hơn maxLength
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '...';
};

/**
 * Capitalize chữ cái đầu mỗi từ
 * @param {string} str
 * @returns {string}
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ===========================
// STORAGE UTILITIES
// ===========================

/**
 * Lấy access token từ localStorage
 * @returns {string | null}
 */
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Lấy refresh token từ localStorage
 * @returns {string | null}
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * Xóa tất cả token (khi logout)
 */
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * Check user đã đăng nhập chưa (dựa vào token)
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = getAccessToken();
  if (!token) return false;

  // Kiểm tra token có hết hạn không (JWT)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Convert to ms
    return Date.now() < expiry;
  } catch {
    return false;
  }
};


/**
 * Decode JWT token để lấy user info
 * @param {string} token
 * @returns {object | null}
 */
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

/**
 * Lấy thông tin user từ access token
 * @returns {object | null}
 */
export const getCurrentUser = () => {
  const token = getAccessToken();
  return decodeToken(token);
};

// ===========================
// MISC UTILITIES
// ===========================

/**
 * Debounce function - hữu ích cho search input
 * @param {Function} func
 * @param {number} delay - ms
 * @returns {Function}
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Generate query string từ object params
 * @param {object} params
 * @returns {string}
 */
export const buildQueryString = (params) => {
  if (!params || typeof params !== 'object') return '';
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return query ? `?${query}` : '';
};

/**
 * Copy text vào clipboard
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback cho trình duyệt cũ
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
};

/**
 * Tạo slug từ string (hữu ích cho URL)
 * "Hello World" → "hello-world"
 * @param {string} str
 * @returns {string}
 */
export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Get thời gian tương đối (vd: "5 phút trước", "2 giờ trước")
 * @param {string | Date} date
 * @returns {string}
 */
export const timeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
  return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
};
