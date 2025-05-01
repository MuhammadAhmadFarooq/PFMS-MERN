const express = require('express');
const router = express.Router();
const { scheduleVaccination, getVaccinationRecords, deleteVaccination } = require('../controllers/vaccinationController');

router.post('/', scheduleVaccination);
router.get('/:flockId', getVaccinationRecords);
router.delete('/:id', deleteVaccination);

module.exports = router;
