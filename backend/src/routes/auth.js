const express = require('express');
const { login, changePassword } = require('../controllers/authController');
const { validateLogin } = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimiter');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();


router.post('/login', loginLimiter, validateLogin, login);
router.post('/change-password', authenticateToken, requireAdmin, changePassword);

module.exports = router;
