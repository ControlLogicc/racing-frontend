import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '', username: '', password: '', confirmPassword: '', role: 'spectator'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register submitted", formData);
    // Gọi API xử lý đăng ký ở đây
  };

  return (
    <div className="auth-container">
      <div className="glow-bg"></div>
      
      <div className="glass-card">
        <h2>Register</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="email" placeholder="Enter Email" onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="input-group">
            <input type="text" placeholder="Enter Username" onChange={(e) => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Confirm Password" onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
          </div>
          
          <div className="flex-between" style={{marginTop: '10px'}}>
            <button type="submit" className="btn-submit" style={{width: '60%'}}>Create Account</button>
            <div className="input-group" style={{width: '35%', margin: '0', marginTop: '10px'}}>
              <select onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="spectator">Role</option>
                <option value="spectator">Spectator</option>
                <option value="jockey">Jockey</option>
                <option value="horse_owner">Horse Owner</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;