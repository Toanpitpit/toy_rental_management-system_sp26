const User = require('../models/User');
const bcrypt = require('bcryptjs');
const s3Service = require('../services/s3Service');

exports.getProfile = async (req, res, next) => {
    try {
        const user = req.user;

        const maptoResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isOnline: user.isOnline,
            avatar: user.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            status: user.status,
            updateAt: user.updatedAt.toISOString()
        }

        res.status(200).json({
            success: true,
            data: maptoResponse
        });
    } catch (error) {
        next(error);
    }
};


exports.updateProfile = async (req, res, next) => {
    try {
        const user = req.user;
        const { name, phone } = req.body;

        const requestForm = {
            name: name,
            phoneNumber: phone,
        }

        const result = await User.findByIdAndUpdate(user._id, requestForm, { new: true, runValidators: true });

        const maptoResponse = {
            id: result._id,
            name: result.name,
            email: result.email,
            phoneNumber: result.phoneNumber,
            role: result.role,
            avatar: result.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            status: result.status,
            updateAt: result.updatedAt.toISOString()
        }

        res.status(200).json({
            success: true,
            data: maptoResponse
        });
    } catch (error) {
        next(error);
    }
};


exports.changePassword = async (req, res, next) => {
    try {
        const user = req.user;
        const { newPassword } = req.body;

        const salt = 10;
        const hashPassword = await bcrypt.hash(newPassword, salt);

        const result = await User.findByIdAndUpdate(user._id, { password: hashPassword });

        const maptoResponse = {
            id: result._id,
            name: result.name,
            email: result.email,
            phoneNumber: result.phoneNumber,
            role: result.role,
            avatar: result.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            status: result.status,
            updateAt: result.updatedAt.toISOString()
        }
        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            data: maptoResponse
        });
    } catch (error) {
        next(error);
    }
};


exports.updateAvatar = async (req, res, next) => {
    try {
        const user = req.user;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }
        const avatarUrl = await s3Service.uploadFile(req.file, 'avatars');

        if (user.avatar && !user.avatar.includes('cdn-icons-png.flaticon.com')) {
            await s3Service.deleteFile(user.avatar);
        }

        const result = await User.findByIdAndUpdate(
            user._id,
            { avatar: avatarUrl },
            { new: true }
        );

        const maptoResponse = {
            id: result._id,
            name: result.name,
            email: result.email,
            phoneNumber: result.phoneNumber,
            role: result.role,
            avatar: result.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            status: result.status,
            updateAt: result.updatedAt.toISOString()
        }

        res.status(200).json({
            success: true,
            data: maptoResponse
        });
    } catch (error) {
        next(error);
    }
};

// ==================== ADMIN METHODS ====================

exports.getAllUsers = async (req, res, next) => {
    try {
        const { search, role, status, page = 1, limit = 10 } = req.query;
        let query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) query.role = role;
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const requester = req.user;
        
        if (!['ADMIN', 'EMPLOYEE', 'CUSTOMER'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const targetUser = await User.findById(id);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Không cho phép đổi role của chính mình hoặc admin hệ thống
        if (targetUser.email === 'admin@gmail.com' || targetUser._id.toString() === requester._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Không thể thay đổi vai trò của tài khoản hệ thống hoặc chính bản thân bạn.' 
            });
        }

        targetUser.role = role;
        await targetUser.save();

        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            data: targetUser
        });
    } catch (error) {
        next(error);
    }
};

exports.updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const requester = req.user;

        if (!['ACTIVE', 'BANNED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const targetUser = await User.findById(id);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Không cho phép khóa tài khoản hệ thống hoặc chính mình
        if (targetUser.email === 'admin@gmail.com' || targetUser._id.toString() === requester._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Không thể thay đổi trạng thái của tài khoản hệ thống hoặc chính bản thân bạn.' 
            });
        }

        targetUser.status = status;
        await targetUser.save();

        res.status(200).json({
            success: true,
            message: `User status updated to ${status}`,
            data: targetUser
        });
    } catch (error) {
        next(error);
    }
};
