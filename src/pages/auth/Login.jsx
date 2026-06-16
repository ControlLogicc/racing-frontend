import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import bg from '../../assets/login-bg.png';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const rolePath = {
    ADMIN: '/admin',
    STAFF: '/admin',
    OWNER: '/owner',
    JOCKEY: '/jockey',
    REFEREE: '/referee',
    HANDICAPPER: '/handicapper',
    SPECTATOR: '/spectator',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Login failed');
        return;
      }

      login(data, data.token);
      navigate(rolePath[data.role] || '/');
    } catch (error) {
      console.error(error);
      alert('Server error');
    }
  };

  return (
    <div
      className="auth-container"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="glow-bg"></div>

      <div className="glass-card">
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username or Email</label>
            <input
              type="text"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div className="flex-between" style={{ fontSize: '13px', marginBottom: '25px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#a0a0a0' }}>
              <input type="checkbox" style={{ accentColor: '#D4AF37' }} />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              style={{ color: '#a0a0a0', textDecoration: 'none', transition: '0.3s' }}
              onMouseOver={(e) => (e.target.style.color = '#D4AF37')}
              onMouseOut={(e) => (e.target.style.color = '#a0a0a0')}
            >
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-submit">
            Login
          </button>

          <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#a0a0a0' }}>
            Don&apos;t have account?{' '}
            <Link to="/register" className="text-gold" style={{ textDecoration: 'none', fontWeight: '600' }}>
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;