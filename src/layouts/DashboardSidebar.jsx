// src/layouts/DashboardSidebar.jsx
// Sidebar lọc menu theo role hiện tại (1 user = 1 role).
// Đọc user.role từ AuthContext, lấy menu tương ứng trong constants/roles.js.
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_MENUS, ROLE_LABELS, normalizeRole } from '../constants/roles';

const GOLD = '#D4AF37';

// Style cho NavLink, đổi theo trạng thái active (Rules: dùng NavLink active style).
const linkStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 16px',
  marginBottom: '6px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 500,
  fontSize: '14px',
  color: isActive ? '#111' : '#e9e9e9',
  backgroundColor: isActive ? GOLD : 'transparent',
  borderLeft: isActive ? `3px solid ${GOLD}` : '3px solid transparent',
  transition: 'all 0.2s ease',
});

export default function DashboardSidebar() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const menu = ROLE_MENUS[role] || [];
  const roleLabel = ROLE_LABELS[role] || 'Unknown';

  return (
    <aside
      className="d-flex flex-column h-100 p-3"
      style={{ backgroundColor: '#111', borderRight: `2px solid ${GOLD}`, minHeight: '100vh' }}
    >
      <div className="text-center mb-4 mt-2">
        <h4 className="fw-bold mb-0" style={{ color: GOLD, letterSpacing: '2px' }}>🏇 HKJC</h4>
        <small style={{ color: '#a0a0a0', fontSize: '11px', textTransform: 'uppercase' }}>
          {roleLabel} Portal
        </small>
      </div>

      <nav className="flex-grow-1">
        {menu.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} style={linkStyle}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        {menu.length === 0 && (
          <p className="text-muted small px-2">No menu for this role.</p>
        )}
      </nav>

      <div className="mt-auto text-center pt-3" style={{ borderTop: '1px solid #2a2a2a' }}>
        <small style={{ color: '#777' }}>© 2026 FPT Horse Racing</small>
      </div>
    </aside>
  );
}