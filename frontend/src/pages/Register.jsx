import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { register } from '../services/apiClient';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const loginStore = useAuthStore(state => state.loginStore);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await register(formData);
            loginStore(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed => Integrity Check Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="terminal-layout">
            <div className="terminal-box glass-panel">
                <h1 className="glitch-text">INITIALIZE_AGENT</h1>

                <div className="auth-subtitle">
                    &gt; connection established.<br />
                    &gt; begin identity synthesis...
                </div>

                {error && <div className="auth-error">[ERROR] {error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="&gt; Desired Alias"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="&gt; Comm-Link (Email)"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="&gt; Security Key (Min 6)"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                        {loading ? 'SYNTHESIZING...' : 'GENERATE IDENTITY'}
                    </button>
                </form>

                <div className="auth-footer">
                    <span className="auth-footer-label">ROBOHASH: STANDBY</span>
                    <Link to="/login" className="auth-link">
                        [ RETURN TO GATEWAY ]
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
