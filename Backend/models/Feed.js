const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    supplier: {
        name: {
            type: String,
            required: true
        },
        contact: String
    },
    usageRecords: [{
        date: {
            type: Date,
            default: Date.now
        },
        amountUsed: {
            type: Number,
            required: true
        }
    }],
    orderDate: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Feed', feedSchema); 