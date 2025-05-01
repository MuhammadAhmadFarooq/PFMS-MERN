const express = require('express');
const router = express.Router();
const { trackMortality, getMortalityRecords } = require('../controllers/mortalityController');

router.post('/', trackMortality);
router.get('/:flockId', getMortalityRecords);

module.exports = router;
