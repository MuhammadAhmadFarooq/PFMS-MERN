const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
    getEggInventory, 
    recordEggSale 
} = require('../controllers/eggInventoryController');

router.route('/')
    .get(protect, getEggInventory)
    .post(protect, recordEggSale);

module.exports = router; 