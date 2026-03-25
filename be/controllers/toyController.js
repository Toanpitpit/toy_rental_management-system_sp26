const Toy = require('../models/Toy');
const ToyDetail = require('../models/ToyDetail');
const s3Service = require('../services/s3Service');

exports.getAllToys = async (req, res, next) => {
  try {
    const { category, status, ownerId, search, page = 1, limit = 12 } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (ownerId) filter.ownerId = ownerId;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    
    const toys = await Toy.find(filter)
      .populate('ownerId', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Toy.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Toys fetched successfully',
      data: toys,
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

exports.getFeaturedToys = async (req, res, next) => {
  try {
    const Inspection = require('../models/Inspection');
    const Booking = require('../models/Booking');

    // Xếp hạng toy bằng số lần pickup inspection
    const topBookings = await Inspection.aggregate([
      { $match: { type: 'pickup' } },
      { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'booking' } },
      { $unwind: '$booking' },
      { $group: { _id: '$booking.toyId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    if (topBookings.length > 0) {
      const toyIds = topBookings.map(b => b._id);
      const toys = await Toy.find({ _id: { $in: toyIds } });
      const sorted = toyIds.map(id => toys.find(t => t._id.equals(id))).filter(Boolean);
      return res.json({ success: true, data: sorted, message: 'Featured toys fetched' });
    }

    // Fallback: lấy 6 toy mới nhất nếu chưa có inspection nào
    const toys = await Toy.find({ status: 'AVAILABLE' }).limit(6).sort({ createdAt: -1 });
    res.json({ success: true, data: toys, message: 'Featured toys fetched (latest)' });
  } catch (error) {
    next(error);
  }
};

exports.getPendingToys = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    const toys = await Toy.find({ status: 'PENDING' }).limit(parseInt(limit)).sort({ createdAt: -1 });
    res.json({ success: true, data: toys, message: 'Pending toys fetched' });
  } catch (error) {
    next(error);
  }
};

exports.getToyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const toy = await Toy.findById(id).populate('ownerId', 'username email');
    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found'
      });
    }

    const toyDetail = await ToyDetail.findOne({ toyId: id });

    res.status(200).json({
      success: true,
      message: 'Toy fetched successfully',
      data: {
        ...toy.toObject(),
        detail: toyDetail
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createToy = async (req, res, next) => {
  try {
    const { 
      ownerId, 
      title, 
      category, 
      thumbnail, 
      pricePerHour, 
      depositValue, 
      status,
      description,
      images,
      specifications,
      ageRange,
      origin
    } = req.body;

    const toy = new Toy({
      ownerId,
      title,
      category,
      thumbnail,
      pricePerHour,
      depositValue,
      status: status || 'AVAILABLE'
    });

    const savedToy = await toy.save();

    const toyDetail = new ToyDetail({
      toyId: savedToy._id,
      description,
      images: images || [],
      specifications: specifications || {},
      ageRange,
      origin
    });

    await toyDetail.save();

    res.status(201).json({
      success: true,
      message: 'Toy created successfully',
      data: {
        ...savedToy.toObject(),
        detail: toyDetail
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateToy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      category, 
      thumbnail, 
      pricePerHour, 
      depositValue, 
      status,
      description,
      images,
      specifications,
      ageRange,
      origin
    } = req.body;

    const toy = await Toy.findByIdAndUpdate(
      id,
      {
        title,
        category,
        thumbnail,
        pricePerHour,
        depositValue,
        status
      },
      { new: true, runValidators: true }
    ).populate('ownerId', 'username email');

    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found'
      });
    }

    let toyDetail = await ToyDetail.findOne({ toyId: id });
    
    if (toyDetail) {
      toyDetail = await ToyDetail.findByIdAndUpdate(
        toyDetail._id,
        {
          description,
          images,
          specifications,
          ageRange,
          origin
        },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Toy updated successfully',
      data: {
        ...toy.toObject(),
        detail: toyDetail
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteToy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const toy = await Toy.findByIdAndDelete(id);
    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found'
      });
    }

    await ToyDetail.deleteOne({ toyId: id });

    res.status(200).json({
      success: true,
      message: 'Toy deleted successfully',
      data: toy
    });
  } catch (error) {
    next(error);
  }
};

exports.updateToyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const toy = await Toy.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('ownerId', 'username email');

    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Toy status updated successfully',
      data: toy
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadToyImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No image files provided'
            });
        }

        const imageUrls = await s3Service.uploadMultipleFiles(req.files, 'toys');

        res.status(200).json({
            success: true,
            data: imageUrls,
            message: `${imageUrls.length} images uploaded successfully`
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await Toy.distinct('category');
        res.status(200).json({
            success: true,
            data: categories,
            message: 'Categories fetched successfully'
        });
    } catch (error) {
        next(error);
    }
};
