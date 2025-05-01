const mongoose = require('mongoose');

const flockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    breed: {
        type: String,
        required: true
    },
    numberOfHens: {
        type: Number,
        required: true
    },
    healthStatus: {
        type: String,
        enum: ['Healthy', 'Sick', 'Quarantined'],
        default: 'Healthy'
    },
    vaccinationRecords: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vaccination'
    }],
    mortalityRecords: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mortality'
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Flock', flockSchema);
