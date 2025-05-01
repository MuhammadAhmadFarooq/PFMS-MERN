const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/userDashboardController');
const { protect } = require('../middlewares/authMiddleware');

// User dashboard route
router.get('/', protect, getDashboardData);

module.exports = router; 