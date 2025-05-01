const Expense = require('../models/Expense');
const { validatePaginationParams, getPaginationMetadata } = require('../utils/pagination');

// Add a new expense
const addExpense = async (req, res) => {
  try {
    const newExpense = new Expense({ ...req.body, user: req.user._id });
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all expenses for the user
const getExpenses = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { page: currentPage, limit: itemsPerPage } = validatePaginationParams(req.query);

    const totalItems = await Expense.countDocuments({ user: req.user._id });
    const expenses = await Expense.find({ user: req.user._id })
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage);

    const paginationMetadata = getPaginationMetadata(currentPage, itemsPerPage, totalItems, req.originalUrl);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: paginationMetadata
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an expense
const updateExpense = async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    res.status(200).json(updatedExpense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an expense
const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const getAdvancedExpenses = async (req, res) => {
    try {
      const { type, minDate, maxDate, sortBy, order, page = 1, limit = 10 } = req.query;
  
      // Build the query object
      const query = {};
      if (type) query.type = type;
      if (minDate || maxDate) {
        query.date = {};
        if (minDate) query.date.$gte = new Date(minDate);
        if (maxDate) query.date.$lte = new Date(maxDate);
      }
  
      // Pagination
      const skip = (page - 1) * limit;
  
      // Sorting
      const sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = order === 'desc' ? -1 : 1; // Default is ascending
      }
  
      // Fetch expenses with filters, sorting, and pagination
      const expenses = await Expense.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));
  
      const totalExpenses = await Expense.countDocuments(query);
  
      res.status(200).json({
        total: totalExpenses,
        page: Number(page),
        limit: Number(limit),
        expenses,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const getTotalExpensesByType = async (req, res) => {
    try {
      const { type } = req.query;
      if (!type) {
        return res.status(400).json({ error: 'Type query parameter is required' });
      }
  
      const total = await Expense.aggregate([
        { $match: { type } },
        { $group: { _id: '$type', totalAmount: { $sum: '$amount' } } },
      ]);
  
      if (total.length === 0) {
        return res.status(404).json({ message: `No expenses found for type: ${type}` });
      }
  
      res.status(200).json({ type, totalAmount: total[0].totalAmount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const getAverageExpense = async (req, res) => {
    try {
      const { minDate, maxDate } = req.query;
  
      const query = {};
      if (minDate || maxDate) {
        query.date = {};
        if (minDate) query.date.$gte = new Date(minDate);
        if (maxDate) query.date.$lte = new Date(maxDate);
      }
  
      const average = await Expense.aggregate([
        { $match: query },
        { $group: { _id: null, averageAmount: { $avg: '$amount' } } },
      ]);
  
      if (average.length === 0) {
        return res.status(404).json({ message: 'No expenses found for the specified date range' });
      }
  
      res.status(200).json({ averageAmount: average[0].averageAmount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
const { Parser } = require('json2csv');
const fs = require('fs');


const exportExpensesToCSV = async (req, res) => {
  try {
    const { type, minDate, maxDate } = req.query;

    const query = {};
    if (type) query.type = type;
    if (minDate || maxDate) {
      query.date = {};
      if (minDate) query.date.$gte = new Date(minDate);
      if (maxDate) query.date.$lte = new Date(maxDate);
    }

    const expenses = await Expense.find(query).lean();
    if (expenses.length === 0) {
      return res.status(404).json({ message: 'No expenses found for the specified filters' });
    }

    const fields = ['type', 'amount', 'description', 'date'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(expenses);

    // Set headers to force download
    res.header('Content-Type', 'text/csv');
res.header('Content-Disposition', 'attachment; filename="expenses.csv"');

    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


  
  module.exports = { addExpense, getExpenses, updateExpense, deleteExpense, getAdvancedExpenses, getTotalExpensesByType, getAverageExpense, exportExpensesToCSV  };