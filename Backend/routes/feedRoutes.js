const express = require('express');
const router = express.Router();
const { addFeed, updateFeedQuantity, getFeedInventory, deleteFeed, exportFeed } = require('../controllers/feedController');

// Feed inventory routes
router.post('/', addFeed); // Add new feed
router.put('/update-quantity', updateFeedQuantity); // Update feed quantity
router.get('/', getFeedInventory); // Get all feed inventory
router.delete('/:id', deleteFeed); // Delete a feed
router.get('/export', exportFeed); // Export feed data
module.exports = router; 