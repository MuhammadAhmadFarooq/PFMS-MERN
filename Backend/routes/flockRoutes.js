const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
    addFlock,
    updateFlock,
    getFlocks,
    deleteFlock,
    exportFlocksToCSV
} = require('../controllers/flockController');

const router = express.Router();

// Flock routes
router.post('/', protect, addFlock); // Add a new flock
router.put('/:id', protect, updateFlock); // Update a flock
router.get('/', protect, getFlocks); // Get all flocks
router.delete('/:id', protect, deleteFlock); // Delete a flock
router.get('/export', exportFlocksToCSV); // Add this line for export functionality

module.exports = router; 