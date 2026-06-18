import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* KHU VỰC LOGO */}
      <div className="logo">
        <Link to="/" className="logo-text" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Bạn nhớ copy ảnh logo của bạn vào thư mục public và đổi tên thành logo.png nhé */}
          <img 
            src="/logo.png" 
            alt="FPT Horse Racing Logo" 
            style={{ height: '45px', objectFit: 'contain' }} 
            onError={(e) => {
              // Nếu chưa có ảnh logo.png, nó sẽ ẩn cái icon ảnh lỗi đi cho đỡ xấu
              e.target.style.display = 'none';
            }}
          />
          <div>
            <span style={{ color: '#ffffff' }}>FPT</span> HORSE RACING
          </div>
        </Link>
      </div>
      
      {/* KHU VỰC MENU ĐIỀU HƯỚNG */}
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
        <NavLink to="/news">News</NavLink>
        <NavLink to="/prediction">Prediction</NavLink>
        <NavLink to="/handicaper">Handicaper</NavLink>
        <NavLink to="/menu">Menu</NavLink>
      </div>

      {/* KHU VỰC NÚT ĐĂNG NHẬP / ĐĂNG KÝ */}
      <div className="auth-buttons">
        <Link to="/login" className="btn btn-login">Login</Link>
        <Link to="/register" className="btn btn-register">Register</Link>
      </div>
    </nav>
  );
};

export default Navbar;