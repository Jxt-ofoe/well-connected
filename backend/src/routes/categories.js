const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET /api/categories
router.get('/', categoryController.getCategories);

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// POST /api/categories
router.post('/', upload.single('image'), categoryController.createCategory);

module.exports = router;
