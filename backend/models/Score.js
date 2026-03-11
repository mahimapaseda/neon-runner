const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    distance: {
        type: Number,
        required: true,
        default: 0,
    },
    puzzlesSolved: {
        type: Number,
        required: true,
        default: 0,
    }
}, { timestamps: true });

module.exports = mongoose.model('Score', scoreSchema);
