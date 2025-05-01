const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    register,
    login,
    updateProfile
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, updateProfile);

module.exports = router;
