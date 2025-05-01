const Mortality = require('../models/Mortality');
const Flock = require('../models/Flock');
const { getPaginationMetadata, validatePaginationParams } = require('../utils/pagination');

exports.trackMortality = async (req, res) => {
    try {
        const { flockId, date, numberOfDeaths, cause } = req.body;

        const flock = await Flock.findById(flockId);
        if (!flock) {
            return res.status(404).json({ message: 'Flock not found' });
        }

        const mortality = await Mortality.create({
            flock: flockId,
            date,
            numberOfDeaths,
            cause,
            user: req.user._id
        });

        flock.mortalityRecords.push(mortality._id);
        await flock.save();

        res.status(201).json({ success: true, mortality });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMortalityRecords = async (req, res) => {
    try {
        const { flockId } = req.params;
        const { page, limit } = req.query;
        const { page: currentPage, limit: itemsPerPage } = validatePaginationParams(req.query);

        const totalItems = await Mortality.countDocuments({ flock: flockId, user: req.user._id });
        const mortalities = await Mortality.find({ flock: flockId, user: req.user._id })
            .skip((currentPage - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const paginationMetadata = getPaginationMetadata(currentPage, itemsPerPage, totalItems, req.originalUrl);

        res.status(200).json({
            success: true,
            data: mortalities,
            pagination: paginationMetadata
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
