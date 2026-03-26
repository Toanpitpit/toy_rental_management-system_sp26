const { body, validationResult, param } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

exports.validateToy = [
  body('ownerId')
    .notEmpty().withMessage('ownerId is required')
    .isMongoId().withMessage('ownerId must be a valid MongoDB ID'),
  body('title')
    .notEmpty().withMessage('title is required')
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('title must be between 3-255 characters'),
  body('category')
    .notEmpty().withMessage('category is required')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('category must be between 2-100 characters'),
  body('pricePerHour')
    .notEmpty().withMessage('pricePerHour is required')
    .isFloat({ min: 0 }).withMessage('pricePerHour must be a positive number'),
  body('depositValue')
    .notEmpty().withMessage('depositValue is required')
    .isFloat({ min: 0 }).withMessage('depositValue must be a positive number'),
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'PENDING', 'RENTED', 'UNAVAILABLE']).withMessage('status must be one of: AVAILABLE, PENDING, RENTED, UNAVAILABLE'),
  body('thumbnail')
    .optional()
    .isString().withMessage('thumbnail must be a string'),
  handleValidationErrors
];

exports.validateToyDetail = [
  body('description')
    .notEmpty().withMessage('description is required')
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('description must be between 10-2000 characters'),
  body('images')
    .optional()
    .isArray().withMessage('images must be an array'),
  body('specifications')
    .optional()
    .isObject().withMessage('specifications must be an object'),
  body('ageRange')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('ageRange must not exceed 100 characters'),
  body('origin')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('origin must not exceed 100 characters'),
  handleValidationErrors
];

exports.validateToyWithDetails = [
  ...exports.validateToy,
  ...exports.validateToyDetail.filter(middleware => middleware._single !== true),
  handleValidationErrors
];

exports.validateMongoId = [
  param('id').isMongoId().withMessage('Invalid toy ID'),
  param('toyId').optional().isMongoId().withMessage('Invalid toy ID'),
  handleValidationErrors
];

exports.validateToyPartialUpdate = [
  body('title').optional().trim().isLength({ min: 3, max: 255 }),
  body('category').optional().trim().isLength({ min: 2, max: 100 }),
  body('pricePerHour').optional().isFloat({ min: 0 }),
  body('depositValue').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['AVAILABLE', 'PENDING', 'RENTED', 'UNAVAILABLE']),
  body('thumbnail').optional().isString(),
  handleValidationErrors
];

exports.validateToyStatusUpdate = [
  body('status')
    .notEmpty().withMessage('status is required')
    .isIn(['AVAILABLE', 'PENDING', 'RENTED', 'UNAVAILABLE']),
  handleValidationErrors
];

exports.validateToyDetailPartialUpdate = [
  body('description').optional().trim(),
  body('images').optional().isArray(),
  body('specifications').optional().isObject(),
  body('ageRange').optional().trim(),
  body('origin').optional().trim(),
  handleValidationErrors
];
