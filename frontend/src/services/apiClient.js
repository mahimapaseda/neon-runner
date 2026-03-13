import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Using the static proxy for SuperHero API to avoid needing an access token
const SUPERHERO_API_BASE = 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api';
const HEART_GAME_API = 'https://marcconrad.com/uob/heart/api.php';

// Auth & Users
export const register = async (userData) => {
    const response = await axios.post(`${BACKEND_URL}/auth/register`, userData);
    return response.data;
};

export const login = async (userData) => {
    const response = await axios.post(`${BACKEND_URL}/auth/login`, userData);
    return response.data;
};

// Scores API
export const fetchLeaderboard = async () => {
    const response = await axios.get(`${BACKEND_URL}/scores/leaderboard`);
    return response.data;
};

export const submitScore = async (scoreData, token) => {
    const response = await axios.post(`${BACKEND_URL}/scores/submit`, scoreData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateProfile = async (profileData, token) => {
    console.log("apiClient: updateProfile called with token", token?.substring(0, 10) + "...");
    const response = await axios.put(`${BACKEND_URL}/auth/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// External APIs
export const fetchSuperHeroes = async () => {
    // Fetching the master array of all heroes from the static proxy
    const response = await axios.get(`${SUPERHERO_API_BASE}/all.json`);
    return response.data;
};

export const fetchHeartPuzzle = async () => {
    // Returns { question, solution }
    const response = await axios.get(HEART_GAME_API);
    return response.data;
};
