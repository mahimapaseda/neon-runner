const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');

const app = express();

// Middleware
const configuredOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const corsOptions = {
    origin: (origin, callback) => {
        // Allow server-to-server calls and local development hosts.
        if (!origin || localhostRegex.test(origin) || configuredOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
};
app.use(cors(corsOptions));
app.use(express.json());

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mpk-runner';

if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not set in environment variables. Using insecure fallback.');
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
