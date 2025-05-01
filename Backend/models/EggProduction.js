const mongoose = require('mongoose');

const eggProductionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        // unique: true,
        validate: {
            validator: function(v) {
                return v <= new Date(); // Cannot add future dates
            },
            message: 'Production date cannot be in the future'
        }
    },
    totalEggs: {
        type: Number,
        required: true,
        min: [0, 'Total eggs cannot be negative']
    },
    notes: {
        type: String,
        maxLength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Add compound index here
eggProductionSchema.index({ user: 1, date: 1 }, { unique: true });


module.exports = mongoose.model('EggProduction', eggProductionSchema); 