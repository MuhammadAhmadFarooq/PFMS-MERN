const { Parser } = require('json2csv');
const Flock = require('../models/Flock');

// Add a new flock
exports.addFlock = async (req, res) => {
    try {
        const newFlock = new Flock({ ...req.body, user: req.user._id });
        const savedFlock = await newFlock.save();
        res.status(201).json(savedFlock);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a flock
exports.updateFlock = async (req, res) => {
    try {
        const updatedFlock = await Flock.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedFlock);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all flocks for the user
exports.getFlocks = async (req, res) => {
    try {
        const flocks = await Flock.find({ user: req.user._id });
        res.status(200).json(flocks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a flock
exports.deleteFlock = async (req, res) => {
    try {
        await Flock.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Flock deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.exportFlocksToCSV = async (req, res) => {
  try {
    const flocks = await Flock.find().lean(); // Fetch all flock records

    if (flocks.length === 0) {
      return res.status(404).json({ message: 'No flock records found' });
    }

    const fields = ['name', 'breed', 'numberOfHens', 'healthStatus', 'createdAt']; // Define the fields to export
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(flocks);

    // Set headers to force download
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="flock-data.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
