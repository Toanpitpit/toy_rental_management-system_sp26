const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mailService = require('../services/mailService');
const User = require('../models/User');


// Generate JWT Token
const generateTokens = (user) => {

  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );


  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          message: 'Email and password are required.'
        },
        success: false,
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found.'
        },
        success: false,
      });
    }

    if (user.status == "BANNED") {
      return res.status(403).json({
        error: {
          message: 'User is banned.'
        },
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user?.password)
    if (!isPasswordMatch) {
      return res.status(400).json({
        error: {
          message: 'Incorrect password.'
        },
        success: false,
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    const result = await User.findByIdAndUpdate(user._id, { token: refreshToken });
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken: accessToken,
      refreshToken: refreshToken,
      data: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createAccount = async (req, res, next) => {
  try {
    const { email, password, phoneNumber } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      phoneNumber: phoneNumber,
      email: email,
      password: hashedPassword,
    })

    const user = await newUser.save()

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        phone: phoneNumber,
        email: email,
        role: user.role,
        createAt: user.createdAt.toISOString()
      }
    })

  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const user = req.user;
    console.log("Logging out user:", user._id);

    const result = await User.findByIdAndUpdate(user._id, { token: null });
    console.log(result);

    res.status(200).json({
      success: true,
      message: 'Logout successful.'
    });
  } catch (error) {
    next(error);
  }
};

exports.sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpire = Date.now() + 5 * 60 * 1000;

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          otp: otp,
          otpExpire: otpExpire
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng với email này" });
    }

    const mailResult = await mailService.sendOTPEmail(user.email, otp);

    if (!mailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Không thể gửi email. Vui lòng thử lại sau.",
        error: mailResult.error
      });
    }

    res.status(200).json({
      success: true,
      message: `Mã OTP đã được gửi tới ${email}`,
    });

  } catch (error) {
    next(error);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    if (!user.otp || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    }

    res.status(200).json({
      success: true,
      message: "Xác thực OTP thành công"
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }
    if (!user.otp || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công"
    });

  } catch (error) {
    next(error);
  }
};

// get new accessToken by refreshToken 
exports.refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is invalid or expired.'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user.token !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token does not match. Please login again.'
      });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully.',
      accessToken: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};









