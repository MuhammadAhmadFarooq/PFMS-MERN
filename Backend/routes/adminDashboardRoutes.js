const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const { getAdminDashboard } = require('../controllers/adminDashboardController');

// Admin dashboard route
router.get('/dashboard', protect, adminOnly, getAdminDashboard);

module.exports = router;