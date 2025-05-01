const User = require('../models/User');
const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');
const EggProduction = require('../models/EggProduction');

exports.getAdminDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        // Calculate total revenue and expenses for profits
        const totalRevenue = await Revenue.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
        const totalExpense = await Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);

        const revenue = totalRevenue[0]?.total || 0;
        const expense = totalExpense[0]?.total || 0;
        const totalProfits = revenue - expense;

        // Calculate total eggs produced
        const eggProductionData = await EggProduction.aggregate([{ $group: { _id: null, total: { $sum: '$totalEggs' } } }]);
        const totalEggsProduced = eggProductionData[0]?.total || 0;

        res.status(200).json({
            success: true,
            totalUsers,
            totalProfits,
            totalEggsProduced
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 