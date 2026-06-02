import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || '';
  const goldColor = '#D4AF37'; // Màu vàng hoàng kim sang trọng

  return (
    <div className="d-flex flex-column h-100 p-3 shadow-lg" style={{ backgroundColor: '#111', borderRight: `2px solid ${goldColor}` }}>
      <div className="text-center mb-4 mt-2">
        <h4 className="fw-bold mb-0" style={{ color: goldColor, letterSpacing: '2px' }}>
          🏇 HKJC
        </h4>
        <small className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Prestige Racing</small>
      </div>
      
      <ul className="nav nav-pills flex-column mb-auto mt-2">
        {/* Menu cho Admin */}
        {role === 'ADMIN' && (
          <li className="nav-item mb-3">
            <Link to="/admin/dashboard" className="nav-link fw-bold text-dark shadow-sm" style={{ backgroundColor: goldColor, borderRadius: '8px' }}>
              ✦ Bảng Điều Khiển
            </Link>
          </li>
        )}
        
        {/* Menu cho Owner (Chủ ngựa) */}
        {role === 'OWNER' && (
          <li className="nav-item mb-3">
            <Link to="/owner/dashboard" className="nav-link fw-bold text-dark shadow-sm" style={{ backgroundColor: goldColor, borderRadius: '8px' }}>
              ✦ Cổng Chủ Ngựa
            </Link>
          </li>
        )}
      </ul>
      
      <div className="mt-auto">
        <div className="p-3 mb-3 rounded text-center" style={{ backgroundColor: '#222', border: '1px solid #333' }}>
          <small className="d-block text-white mb-1">Đang đăng nhập:</small>
          <strong style={{ color: goldColor }}>{user?.fullName || 'Khách'}</strong>
          <span className="badge bg-dark border border-secondary d-block mt-2">{role}</span>
        </div>
        <hr style={{ borderColor: goldColor, opacity: 0.3 }} />
        <button 
          onClick={handleLogout} 
          className="btn w-100 fw-bold" 
          style={{ backgroundColor: 'transparent', color: goldColor, border: `1px solid ${goldColor}` }}
          onMouseOver={(e) => { e.target.style.backgroundColor = goldColor; e.target.style.color = '#111'; }}
          onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = goldColor; }}
        >
          ĐĂNG XUẤT
        </button>
      </div>
    </div>
  );
};

export default Sidebar;