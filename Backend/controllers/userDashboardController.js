const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');
const EggProduction = require('../models/EggProduction');
const Mortality = require('../models/Mortality');
const Feed = require('../models/Feed');
const EggInventory = require('../models/EggInventory');

exports.getDashboardData = async (req, res) => {
    try {
        // Fetch egg production data for the user
        const eggProductionData = await EggProduction.find({ user: req.user._id }).sort({ date: -1 });
        const totalEggsProduced = eggProductionData.reduce((acc, record) => acc + record.totalEggs, 0);

        // Fetch mortality data for the user
        const mortalityData = await Mortality.find({ user: req.user._id }).sort({ date: -1 });
        const totalMortality = mortalityData.reduce((acc, record) => acc + record.numberOfDeaths, 0);

        // Fetch feed usage data for the user
        const feedData = await Feed.find({ user: req.user._id });
        const totalFeedUsed = feedData.reduce((acc, feed) => acc + feed.usageRecords.reduce((sum, record) => sum + record.amountUsed, 0), 0);

        // Fetch egg inventory data for the user
        const eggInventoryData = await EggInventory.find({ user: req.user._id });
        const totalEggsInInventory = eggInventoryData.reduce((acc, record) => acc + record.remainingEggs, 0);

        // Fetch total revenue and expenses for analytics
        const totalRevenue = await Revenue.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpense = await Expense.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const revenue = totalRevenue[0]?.total || 0;
        const expense = totalExpense[0]?.total || 0;
        const totalProfits = revenue - expense;

        // Fetch trends over time
        const revenueTrends = await Revenue.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' } }, total: { $sum: '$amount' } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        const expenseTrends = await Expense.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' } }, total: { $sum: '$amount' } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Fetch breakdown by type
        const revenueBreakdown = await Revenue.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$source', total: { $sum: '$amount' } } }
        ]);
        const expenseBreakdown = await Expense.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$type', total: { $sum: '$amount' } } }
        ]);

        // Alerts
        const lowFeedAlert = feedData.some(feed => feed.quantity < 10); // Example threshold
        const highMortalityAlert = totalMortality > 50; // Example threshold

        res.status(200).json({
            success: true,
            totalEggsProduced,
            totalMortality,
            totalFeedUsed,
            totalEggsInInventory,
            totalProfits,
            revenueTrends,
            expenseTrends,
            revenueBreakdown,
            expenseBreakdown,
            alerts: {
                lowFeed: lowFeedAlert,
                highMortality: highMortalityAlert
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 