const Score = require('../models/Score');

// @desc    Submit a new score
// @route   POST /api/scores/submit
// @access  Private
const submitScore = async (req, res) => {
    const { distance, puzzlesSolved } = req.body;
    const userId = req.user._id;

    try {
        const score = await Score.create({
            userId,
            distance: Number(distance) || 0,
            puzzlesSolved: Number(puzzlesSolved) || 0,
        });

        res.status(201).json(score);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get global leaderboard
// @route   GET /api/scores/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        // Aggregate to get top scores, sorted primarily by distance, then puzzles.
        // Or we just fetch highest raw scores globally.
        // Given the infinite runner nature, distance is the primary metric.

        const topScores = await Score.find()
            .populate('userId', 'username avatarUrl') // Get info about the user
            .sort({ distance: -1, puzzlesSolved: -1 }) // Sort descending
            .limit(10); // Top 10

        res.json(topScores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitScore,
    getLeaderboard
};
