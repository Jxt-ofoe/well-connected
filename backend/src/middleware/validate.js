const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => e.msg) });
  }
  next();
};

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const validateProduct = [
  body('name').notEmpty().trim().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category').optional().trim(),
  body('description').optional().trim(),
  body('image').optional().trim(),
  handleValidation,
];

const validateOrder = [
  body('customerName').notEmpty().trim().withMessage('Customer name is required'),
  body('phone').notEmpty().trim().withMessage('Phone number is required'),
  body('address').notEmpty().trim().withMessage('Address is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id').isInt().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidation,
];

const validateOrderStatus = [
  body('status').isIn(['pending', 'paid', 'delivered']).withMessage('Status must be pending, paid, or delivered'),
  handleValidation,
];

module.exports = { validateLogin, validateProduct, validateOrder, validateOrderStatus };
