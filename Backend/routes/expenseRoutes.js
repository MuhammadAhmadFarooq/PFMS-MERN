const express = require('express');
const { addExpense, getExpenses, updateExpense, deleteExpense, getAdvancedExpenses, getTotalExpensesByType, getAverageExpense, exportExpensesToCSV } = require('../controllers/expenseController');
const router = express.Router();

// Routes for Expense Management
router.post('/add', addExpense); // Add a new expense
router.get('/', getExpenses);    // Get all expenses
router.get('/advanced', getAdvancedExpenses);
router.put('/:id', updateExpense); // Update an expense
router.delete('/:id', deleteExpense); // Delete an expense

// Get total expenses by type
router.get('/total-by-type', getTotalExpensesByType);

// Get average expense over a time period
router.get('/average', getAverageExpense);

// Export filtered results to CSV
router.get('/export', exportExpensesToCSV);


module.exports = router;





