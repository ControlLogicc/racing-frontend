import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted", formData);
  };

  return (
    <div className="auth-container">
      <div className="glow-bg"></div>
      
      <div className="glass-card">
        <h2>Login</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username or Email</label>
            <input 
              type="text" 
              placeholder="Enter your email"
              onChange={(e) => setFormData({...formData, identifier: e.target.value})}
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="flex-between" style={{fontSize: '13px', marginBottom: '25px'}}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#a0a0a0' }}>
              <input type="checkbox" style={{ accentColor: '#D4AF37' }}/> Remember me
            </label>
            <Link to="/forgot-password" style={{color: '#a0a0a0', textDecoration: 'none', transition: '0.3s'}} onMouseOver={(e)=> e.target.style.color='#D4AF37'} onMouseOut={(e)=> e.target.style.color='#a0a0a0'}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-submit">Login</button>

          <p style={{textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#a0a0a0'}}>
            Don't have account? <Link to="/register" className="text-gold" style={{textDecoration: 'none', fontWeight: '600'}}>Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;