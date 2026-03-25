const ToyDetail = require('../models/ToyDetail');
const Toy = require('../models/Toy');

// GET all toy details
exports.getAllToyDetails = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    
    const toyDetails = await ToyDetail.find()
      .populate('toyId', 'title category thumbnail pricePerDay')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ToyDetail.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Toy details fetched successfully',
      data: toyDetails,
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

// GET toy detail by toy ID
exports.getToyDetailByToyId = async (req, res, next) => {
  try {
    const { toyId } = req.params;

    const toyDetail = await ToyDetail.findOne({ toyId })
      .populate('toyId', 'title category thumbnail pricePerDay status');

    if (!toyDetail) {
      return res.status(404).json({
        success: false,
        message: 'Toy detail not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Toy detail fetched successfully',
      data: toyDetail
    });
  } catch (error) {
    next(error);
  }
};

// CREATE toy detail (for existing toy)
exports.createToyDetail = async (req, res, next) => {
  try {
    const { 
      toyId, 
      description, 
      images, 
      specifications, 
      ageRange, 
      origin 
    } = req.body;

    // Check if toy exists
    const toy = await Toy.findById(toyId);
    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found'
      });
    }

    // Check if detail already exists
    const existingDetail = await ToyDetail.findOne({ toyId });
    if (existingDetail) {
      return res.status(409).json({
        success: false,
        message: 'Toy detail already exists for this toy'
      });
    }

    const toyDetail = new ToyDetail({
      toyId,
      description,
      images: images || [],
      specifications: specifications || {},
      ageRange,
      origin
    });

    const savedToyDetail = await toyDetail.save();

    res.status(201).json({
      success: true,
      message: 'Toy detail created successfully',
      data: await savedToyDetail.populate('toyId', 'title category thumbnail pricePerDay')
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE toy detail
exports.updateToyDetail = async (req, res, next) => {
  try {
    const { toyId } = req.params;
    const { 
      description, 
      images, 
      specifications, 
      ageRange, 
      origin 
    } = req.body;

    const toyDetail = await ToyDetail.findOneAndUpdate(
      { toyId },
      {
        description,
        images,
        specifications,
        ageRange,
        origin
      },
      { new: true, runValidators: true }
    ).populate('toyId', 'title category thumbnail pricePerDay');

    if (!toyDetail) {
      return res.status(404).json({
        success: false,
        message: 'Toy detail not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Toy detail updated successfully',
      data: toyDetail
    });
  } catch (error) {
    next(error);
  }
};

// DELETE toy detail
exports.deleteToyDetail = async (req, res, next) => {
  try {
    const { toyId } = req.params;

    const toyDetail = await ToyDetail.findOneAndDelete({ toyId });

    if (!toyDetail) {
      return res.status(404).json({
        success: false,
        message: 'Toy detail not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Toy detail deleted successfully',
      data: toyDetail
    });
  } catch (error) {
    next(error);
  }
};

exports.updateToyDetailFields = async (req, res, next) => {
  try {
    const { toyId } = req.params;
    const updateFields = req.body;

    const toyDetail = await ToyDetail.findOneAndUpdate(
      { toyId },
      updateFields,
      { new: true, runValidators: true }
    ).populate('toyId', 'title category thumbnail pricePerDay');

    if (!toyDetail) {
      return res.status(404).json({
        success: false,
        message: 'Toy detail not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Toy detail fields updated successfully',
      data: toyDetail
    });
  } catch (error) {
    next(error);
  }
};
