const express = require('express');
const { registerUser, loginUser, getProfile, updateProfile } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
