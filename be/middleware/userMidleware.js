
const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.validateUpdateProfile = async (req, res, next) => {
    const { name, phone } = req.body;
    if (!name.trim() || !phone) {
        return res.status(401).json({
            error: {
                message: 'Name and phone are required.'
            },
            success: false,
        });
    }

    const phoneRegex = /^(0)+([0-9]{9})$/;

    if (!phoneRegex.test(phone.trim())) {
        return res.status(401).json({
            error: {
                message: 'Phone must be 10 digits and start with 0'
            },
            success: false,
        });
    }
    next();
}


exports.validateUpdatePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword.trim() || !newPassword.trim()) {
        return res.status(401).json({
            error: {
                message: 'Old password and new password are required.'
            },
            success: false,
        });
    }

    const user = req.user;
    const isPasswordMatch = await bcrypt.compare(oldPassword, user?.password)
    if (!isPasswordMatch) {
        return res.status(401).json({
            error: {
                message: 'Incorrect old password.'
            },
            success: false,
        });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword.trim())) {
        return res.status(401).json({
            error: {
                message: 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character'
            },
            success: false,
        });
    }

    const isNewPasswordMatch = await bcrypt.compare(newPassword, user?.password)
    if (isNewPasswordMatch) {
        return res.status(401).json({
            error: {
                message: 'New password cannot be the same as old password.'
            },
            success: false,
        });
    }
    next();

}