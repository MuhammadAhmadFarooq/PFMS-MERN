const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    addEggProduction,
    getEggProductionRecords,
    exportEggProduction,
    deleteEggProduction
} = require('../controllers/eggProductionController');

// CRUD operations
router.post('/', protect, addEggProduction);
router.get('/', protect, getEggProductionRecords);
router.get('/export', protect, exportEggProduction);
router.delete('/:id', protect, deleteEggProduction);

module.exports = router; 