const EggInventory = require('../models/EggInventory');

exports.getEggInventory = async (req, res) => {
    try {
        const inventory = await EggInventory.find({ user: req.user._id })
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: inventory
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.recordEggSale = async (req, res) => {
    try {
        const { buyer, quantity, saleDate } = req.body;

        // Get latest inventory for the user
        const currentInventory = await EggInventory.findOne({ user: req.user._id }).sort({ createdAt: -1 });
        
        if (!currentInventory) {
            return res.status(404).json({
                success: false,
                message: 'No inventory found'
            });
        }

        if (quantity > currentInventory.remainingEggs) {
            return res.status(400).json({
                success: false,
                message: 'Cannot sell more eggs than available in inventory'
            });
        }

        // Update inventory with sale
        const updatedInventory = await EggInventory.findByIdAndUpdate(
            currentInventory._id,
            {
                $push: {
                    soldEggs: {
                        buyer,
                        quantity,
                        saleDate
                    }
                },
                $inc: { remainingEggs: -quantity }
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedInventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Add a new method to get inventory history
exports.getInventoryHistory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const query = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const inventoryHistory = await EggInventory.find(query)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: inventoryHistory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}; 