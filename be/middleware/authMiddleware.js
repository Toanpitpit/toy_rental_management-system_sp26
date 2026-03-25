const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to req
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Authorization denied.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      console.warn(`Auth Failed: User not found for ID ${decoded.id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user.status == "BANNED") {
      return res.status(403).json({
        success: false,
        message: 'User is banned.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token is not valid or expired.'
    });
  }
};

// Authorize based on roles
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please login first.'
      });
    }
    const role = req.user.role?.toUpperCase() || 'GUEST';

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${role}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

exports.validateRegister = async (req, res, next) => {
  const { email, password, phoneNumber } = req.body;

  if (!email || !password || !phoneNumber) {
    return res.status(401).json({
      error: {
        message: 'Email and password , phone are required.'
      },
      success: false,
    });
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email.trim())) {
    return res.status(401).json({
      error: {
        message: 'Email not correct format'
      },
      success: false,
    });
  }

  const phoneRegex = /^(0)+([0-9]{9})$/;

  if (!phoneRegex.test(phoneNumber.trim())) {
    return res.status(401).json({
      error: {
        message: 'Phone must be 10 digits and start with 0'
      },
      success: false,
    });
  }

  const findUser = await User.findOne({ email: email })

  if (findUser) {
    return res.status(401).json({
      error: {
        message: 'Email is aready exits.'
      },
      success: false,
    });
  }

  next();
}

