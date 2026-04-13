const express = require('express');
const { submitScore, getLeaderboard } = require('../controllers/scoreController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/submit', protect, submitScore);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
