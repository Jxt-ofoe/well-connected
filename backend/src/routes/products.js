const express = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validate');

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, validateProduct, createProduct);
router.put('/:id', authenticateToken, requireAdmin, validateProduct, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

module.exports = router;
