import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { login } from '../services/apiClient';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
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
            const data = await login(formData);
            loginStore(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed => Access Denied');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="terminal-layout">
            <div className="terminal-box glass-panel">
                <h1 className="glitch-text">ACCESS_TERMINAL</h1>

                <div className="auth-subtitle">
                    &gt; system.connect("MPK_NET");<br />
                    &gt; awaits credentials...
                </div>

                {error && <div className="auth-error">[ERROR] {error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="&gt; Enter Username or Email"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="&gt; Enter Passkey"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                        {loading ? 'AUTHENTICATING...' : 'ESTABLISH CONNECTION'}
                    </button>
                </form>

                <div className="auth-footer">
                    <span className="auth-footer-label">SYS: ONLINE</span>
                    <Link to="/register" className="auth-link">
                        [ REGISTRY PROTOCOL ]
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
