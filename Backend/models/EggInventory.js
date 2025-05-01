const mongoose = require('mongoose');

const eggInventorySchema = new mongoose.Schema({
    soldEggs: [{
        buyer: {
            name: {
                type: String,
                required: [true, 'Buyer name is required'],
                trim: true
            },
            contact: {
                type: String,
                trim: true,
                validate: {
                    validator: function(v) {
                        return /^\+?[\d\s-]+$/.test(v); // Basic phone number validation
                    },
                    message: 'Please enter a valid contact number'
                }
            }
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        saleDate: {
            type: Date,
            default: Date.now,
            validate: {
                validator: function(v) {
                    return v <= new Date();
                },
                message: 'Sale date cannot be in the future'
            }
        }
    }],
    remainingEggs: {
        type: Number,
        required: true,
        min: [0, 'Remaining eggs cannot be negative']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EggInventory', eggInventorySchema); 