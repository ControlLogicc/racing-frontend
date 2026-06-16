// src/layouts/DashboardHeader.jsx
// Header chung cho DashboardLayout: hiển thị tên user + role + nút Logout.
import { useAuth } from '../context/AuthContext';
import { normalizeRole, ROLE_LABELS } from '../constants/roles';

const GOLD = '#D4AF37';

export default function DashboardHeader() {
  const { user, logout } = useAuth();

  // Chấp nhận nhiều kiểu field tên, fallback "User".
  const displayName = user?.fullName || user?.username || user?.name || 'User';
  const role = normalizeRole(user?.role);
  const roleLabel = ROLE_LABELS[role] || role || '—';

  // Logout gọi thẳng logout() từ AuthContext (đã tự navigate('/login')).
  // Không dùng alert() trình duyệt (Rules Mục 14).
  const handleLogout = () => logout();

  return (
    <header
      className="d-flex justify-content-between align-items-center px-4 py-3 sticky-top"
      style={{
        backgroundColor: 'rgba(15,15,17,0.95)',
        borderBottom: `1px solid ${GOLD}`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="d-flex align-items-center gap-2">
        <span style={{ fontSize: '20px' }}>🏇</span>
        <span className="fw-bold" style={{ color: GOLD, letterSpacing: '1px' }}>
          FPT HORSE RACING
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="text-end">
          <div className="fw-semibold" style={{ color: '#f5f5f5', lineHeight: 1.1 }}>{displayName}</div>
          <span
            className="badge mt-1"
            style={{ backgroundColor: 'transparent', color: GOLD, border: `1px solid ${GOLD}`, textTransform: 'capitalize' }}
          >
            {roleLabel}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-sm fw-bold"
          style={{ backgroundColor: 'transparent', color: GOLD, border: `1px solid ${GOLD}` }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = '#111'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = GOLD; }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}