const Vaccination = require('../models/Vaccination');
const Flock = require('../models/Flock');

exports.scheduleVaccination = async (req, res) => {
    try {
        const { flockId, vaccineType, administrationDate, notes } = req.body;

        const flock = await Flock.findById(flockId);
        if (!flock) {
            return res.status(404).json({ message: 'Flock not found' });
        }

        const vaccination = await Vaccination.create({
            flock: flockId,
            vaccineType,
            administrationDate,
            notes,
            user: req.user._id
        });

        flock.vaccinationRecords.push(vaccination._id);
        await flock.save();

        res.status(201).json({ success: true, vaccination });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getVaccinationRecords = async (req, res) => {
    try {
        const { flockId } = req.params;
        const vaccinations = await Vaccination.find({ flock: flockId, user: req.user._id });

        res.status(200).json({ success: true, vaccinations });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteVaccination = async (req, res) => {
    try {
        const { id } = req.params;
        await Vaccination.findByIdAndDelete(id);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
