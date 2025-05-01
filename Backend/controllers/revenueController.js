const Revenue = require('../models/Revenue');
const { validatePaginationParams, getPaginationMetadata } = require('../utils/pagination');
const { Parser } = require('json2csv');

// Add a new revenue
const addRevenue = async (req, res) => {
  try {
    const newRevenue = new Revenue({
      ...req.body,
      user: req.user._id // Associate with the logged-in user
    });
    const savedRevenue = await newRevenue.save();
    res.status(201).json(savedRevenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all revenues for the logged-in user
const getRevenues = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { page: currentPage, limit: itemsPerPage } = validatePaginationParams(req.query);

    const totalItems = await Revenue.countDocuments({ user: req.user._id }); // Count only user's revenues
    const revenues = await Revenue.find({ user: req.user._id }) // Fetch only user's revenues
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage);

    const paginationMetadata = getPaginationMetadata(currentPage, itemsPerPage, totalItems, req.originalUrl);

    res.status(200).json({
      success: true,
      data: revenues,
      pagination: paginationMetadata
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Advanced search for revenues for the logged-in user
const getAdvancedRevenues = async (req, res) => {
  try {
    const { source, minDate, maxDate, sortBy, order, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id }; // Ensure query is user-specific
    if (source) query.source = source;
    if (minDate || maxDate) {
      query.date = {};
      if (minDate) query.date.$gte = new Date(minDate);
      if (maxDate) query.date.$lte = new Date(maxDate);
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    if (sortBy) sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const revenues = await Revenue.find(query).sort(sortOptions).skip(skip).limit(Number(limit));
    const totalRevenues = await Revenue.countDocuments(query);

    res.status(200).json({
      total: totalRevenues,
      page: Number(page),
      limit: Number(limit),
      revenues,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a revenue for the logged-in user
const updateRevenue = async (req, res) => {
  try {
    const updatedRevenue = await Revenue.findByIdAndUpdate(
      { _id: req.params.id, user: req.user._id }, // Ensure the user owns the revenue
      req.body,
      { new: true }
    );
    if (!updatedRevenue) {
      return res.status(404).json({ message: 'Revenue not found or you do not have permission to update it.' });
    }
    res.status(200).json(updatedRevenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a revenue
const deleteRevenue = async (req, res) => {
  try {
    await Revenue.findByIdAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ message: 'Revenue deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Total revenue by source
const getTotalRevenueBySource = async (req, res) => {
  try {
    const { source } = req.query;
    if (!source) return res.status(400).json({ error: 'Source query parameter is required' });

    const total = await Revenue.aggregate([
      { $match: { source, user: req.user._id } },
      { $group: { _id: '$source', totalAmount: { $sum: '$amount' } } },
    ]);

    if (total.length === 0) return res.status(404).json({ message: `No revenues found for source: ${source}` });

    res.status(200).json({ source, totalAmount: total[0].totalAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Average revenue over a time period
const getAverageRevenue = async (req, res) => {
  try {
    const { minDate, maxDate } = req.query;

    const query = {};
    if (minDate || maxDate) {
      query.date = {};
      if (minDate) query.date.$gte = new Date(minDate);
      if (maxDate) query.date.$lte = new Date(maxDate);
    }

    const average = await Revenue.aggregate([
      { $match: query },
      { $group: { _id: null, averageAmount: { $avg: '$amount' } } },
    ]);

    if (average.length === 0) return res.status(404).json({ message: 'No revenues found for the specified date range' });

    res.status(200).json({ averageAmount: average[0].averageAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export revenues to CSV
const exportRevenuesToCSV = async (req, res) => {
  try {
    const { source, minDate, maxDate } = req.query;

    const query = {};
    if (source) query.source = source;
    if (minDate || maxDate) {
      query.date = {};
      if (minDate) query.date.$gte = new Date(minDate);
      if (maxDate) query.date.$lte = new Date(maxDate);
    }

    const revenues = await Revenue.find(query).lean();
    if (revenues.length === 0) return res.status(404).json({ message: 'No revenues found for the specified filters' });

    const fields = ['source', 'amount', 'description', 'date'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(revenues);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="revenues.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addRevenue,
  getRevenues,
  getAdvancedRevenues,
  updateRevenue,
  deleteRevenue,
  getTotalRevenueBySource,
  getAverageRevenue,
  exportRevenuesToCSV,
};
