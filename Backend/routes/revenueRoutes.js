const express = require('express');
const {
  addRevenue,
  getRevenues,
  updateRevenue,
  deleteRevenue,
  getAdvancedRevenues,
  getTotalRevenueBySource,
  getAverageRevenue,
  exportRevenuesToCSV,
} = require('../controllers/revenueController');

const router = express.Router();

// Define all routes
router.post('/add', addRevenue);
router.get('/', getRevenues);
router.get('/advanced', getAdvancedRevenues);
router.put('/:id', updateRevenue);
router.delete('/:id', deleteRevenue);
router.get('/total-by-source', getTotalRevenueBySource);
router.get('/average', getAverageRevenue);
router.get('/export', exportRevenuesToCSV);

module.exports = router; // Ensure the router is exported correctly
