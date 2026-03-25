const Toy = require('../models/Toy');

exports.checkToyOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User ID not found'
      });
    }

    const toy = await Toy.findById(id);
    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found'
      });
    }

    if (toy.ownerId.toString() !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this toy'
      });
    }

    req.toy = toy;
    next();
  } catch (error) {
    next(error);
  }
};

exports.checkToyOwnershipByToyId = async (req, res, next) => {
  try {
    const { toyId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User ID not found'
      });
    }

    const toy = await Toy.findById(toyId);
    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found'
      });
    }

    // Allow if user is owner or admin
    if (toy.ownerId.toString() !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this toy'
      });
    }

    req.toy = toy;
    next();
  } catch (error) {
    next(error);
  }
};

exports.requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Authentication required'
    });
  }
  next();
};

exports.checkOwnerIdMatch = (req, res, next) => {
  const { ownerId } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (userRole !== 'ADMIN' && ownerId !== userId) {
    return res.status(403).json({
      success: false,
      message: 'You can only create toys for yourself'
    });
  }

  next();
};
