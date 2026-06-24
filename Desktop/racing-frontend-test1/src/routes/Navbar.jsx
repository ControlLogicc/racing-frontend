import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { PersonCircle, BoxArrowRight, Speedometer2 } from 'react-bootstrap-icons';
import { useAuth } from '../hooks/useAuth';
import { HOME_ROUTE_BY_ROLE } from '../constants/roles';
import './layout.css';

const ROLE_LABEL = {
  admin: 'Admin',
  staff: 'Staff',
  referee: 'Referee',
  owner: 'Owner',
  jockey: 'Jockey',
  spectator: 'Spectator',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dashboardRoute = user ? HOME_ROUTE_BY_ROLE[user.role] || '/' : '/';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* LOGO — luôn về trang chủ công khai */}
      <div className="logo">
        <Link to="/" className="logo-link">
          <span className="logo-icon">🐎</span>
          <span className="logo-text">FPT<span>Racing</span></span>
        </Link>
      </div>

      {/* MENU CÔNG KHAI — luôn hiện cho mọi role, kể cả đã đăng nhập */}
      <div className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/news">News</NavLink>
        <NavLink to="/menu">Menu</NavLink>
      </div>

      {/* AUTH BUTTONS */}
      <div className="auth-buttons d-flex align-items-center">
        {user ? (
          <div className="d-flex align-items-center gap-2">
            <Link to={dashboardRoute} className="btn-dashboard">
              <Speedometer2 className="me-2" />
              Vào Dashboard
            </Link>
            <Dropdown align="end">
              <Dropdown.Toggle as="button" className="navbar-user-toggle" id="navbar-user-dropdown">
                <PersonCircle size={20} className="me-2" />
                <span className="navbar-user-name">{user.fullName}</span>
                <span className="navbar-user-role">{ROLE_LABEL[user.role] || user.role}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="navbar-user-menu">
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <BoxArrowRight className="me-2" />
                  Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn btn-login">Login</Link>
            <Link to="/register" className="btn btn-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}