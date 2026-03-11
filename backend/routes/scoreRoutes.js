const express = require('express');
const { submitScore, getLeaderboard } = require('../controllers/scoreController');

const router = express.Router();

router.post('/submit', submitScore);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
