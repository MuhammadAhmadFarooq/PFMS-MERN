const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: { type: String, required: true },  // e.g., Feed, Labor
  amount: { type: Number, required: true }, // Expense amount
  date: { type: Date, default: Date.now },  // Default to current date
  description: { type: String },            // Optional description
});

module.exports = mongoose.model('Expense', ExpenseSchema);
