const EggProduction = require('../models/EggProduction');
const EggInventory = require('../models/EggInventory');
const { validatePaginationParams, getPaginationMetadata } = require('../utils/pagination');
const { Parser } = require('json2csv');

exports.addEggProduction = async (req, res) => {
    try {
        const { date, totalEggs, notes } = req.body;

        const userId = req.user._id; // Store user ID in a variable
        
        // Create date at start of day in UTC
        const formattedDate = new Date(date);
        formattedDate.setUTCHours(0, 0, 0, 0);

        // Refined search query
        const existingRecord = await EggProduction.findOne({
            user: userId,
            date: {
                $gte: formattedDate,
                $lt: new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (existingRecord) {
            const updatedRecord = await EggProduction.findOneAndUpdate(
                { _id: existingRecord._id },
                { totalEggs, notes },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                data: updatedRecord,
                message: 'Production record updated successfully'
            });
        }

        // Create new record with UTC date
        const eggProduction = await EggProduction.create({
            date: formattedDate,
            totalEggs,
            notes,
            user: userId
        });

        // Update egg inventory
        const inventory = await EggInventory.findOne().sort({ createdAt: -1 });
        
        const newInventory = await EggInventory.create({
            totalEggs: (inventory?.remainingEggs || 0) + totalEggs,
            remainingEggs: (inventory?.remainingEggs || 0) + totalEggs,
            productionDate: date,
            soldEggs: [],
            user: userId // Associate with the logged-in user
        });

        res.status(201).json({
            success: true,
            data: {
                production: eggProduction,
                inventory: newInventory
            }
        });
    } catch (error) {
        // Check for duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Record already exists for this date'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error adding production record',
            error: error.message
        });
    }
};

exports.getEggProductionRecords = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const { page: currentPage, limit: itemsPerPage } = validatePaginationParams(req.query);

        const totalItems = await EggProduction.countDocuments({ user: req.user._id });
        const eggProductions = await EggProduction.find({ user: req.user._id })
            .sort({ date: -1 })
            .skip((currentPage - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const paginationMetadata = getPaginationMetadata(currentPage, itemsPerPage, totalItems, req.originalUrl);

        res.status(200).json({
            success: true,
            data: eggProductions,
            pagination: paginationMetadata
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.exportEggProduction = async (req, res) => {
    try {
        const eggProductions = await EggProduction.find({ user: req.user._id });

        if (eggProductions.length === 0) {
            return res.status(404).json({ message: 'No egg production records found' });
        }

        const fields = ['date', 'totalEggs', 'notes'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(eggProductions);

        // Set headers to force download
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="egg-production.csv"');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteEggProduction = async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the request parameters

        // Find and delete the egg production record
        const deletedRecord = await EggProduction.findOneAndDelete({ _id: id, user: req.user._id });
        
        if (!deletedRecord) {
            return res.status(404).json({ message: 'Egg production record not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Egg production record deleted successfully',
            data: deletedRecord
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 