const Address = require("../models/Address");

/**
 * Get all addresses for the current user
 */
exports.getAddressByUserId = async (req, res, next) => {
    try {
        const user = req.user;
        const addresses = await Address.find({ userId: user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.status(200).json({
            success: true,
            data: addresses
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new address
 */
exports.createAddress = async (req, res, next) => {
    try {
        const user = req.user;
        const { receiverName, receiverPhone, province, district, ward, detail, isDefault } = req.body;

        // If this is the user's first address, make it default
        const addressCount = await Address.countDocuments({ userId: user._id });
        const shouldBeDefault = addressCount === 0 ? true : isDefault;

        // If new address is set as default, unset previous default
        if (shouldBeDefault) {
            await Address.updateMany({ userId: user._id }, { isDefault: false });
        }

        const newAddress = await Address.create({
            userId: user._id,
            receiverName,
            receiverPhone,
            province,
            district,
            ward,
            detail,
            isDefault: shouldBeDefault
        });

        res.status(201).json({
            success: true,
            data: newAddress
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing address
 */
exports.updateAddress = async (req, res, next) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { receiverName, receiverPhone, province, district, ward, detail, isDefault } = req.body;

        let address = await Address.findOne({ _id: id, userId: user._id });
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        // If updating to default, unset others
        if (isDefault && !address.isDefault) {
            await Address.updateMany({ userId: user._id }, { isDefault: false });
        }

        address.receiverName = receiverName || address.receiverName;
        address.receiverPhone = receiverPhone || address.receiverPhone;
        address.province = province || address.province;
        address.district = district || address.district;
        address.ward = ward || address.ward;
        address.detail = detail || address.detail;
        address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

        await address.save();

        res.status(200).json({
            success: true,
            data: address
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete an address
 */
exports.deleteAddress = async (req, res, next) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const address = await Address.findOne({ _id: id, userId: user._id });
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        const wasDefault = address.isDefault;
        await Address.deleteOne({ _id: id });

        // If we deleted the default address, make the most recent one default
        if (wasDefault) {
            const latestAddress = await Address.findOne({ userId: user._id }).sort({ createdAt: -1 });
            if (latestAddress) {
                latestAddress.isDefault = true;
                await latestAddress.save();
            }
        }

        res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Set an address as default
 */
exports.setDefaultAddress = async (req, res, next) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const address = await Address.findOne({ _id: id, userId: user._id });
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        await Address.updateMany({ userId: user._id }, { isDefault: false });
        address.isDefault = true;
        await address.save();

        res.status(200).json({
            success: true,
            message: "Default address updated",
            data: address
        });
    } catch (error) {
        next(error);
    }
};