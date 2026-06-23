import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants/roles';

// Cấu hình danh sách Menu, ánh xạ theo từng role (lấy UI từ file layout cũ của bạn)
const MENU_CONFIG = {
  [ROLES.ADMIN]: [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Người dùng', icon: '👥' },
    { path: '/admin/seasons', label: 'Season', icon: '📅' },
    { path: '/admin/racecourses', label: 'Đường đua', icon: '🗺️' },
    { path: '/admin/meetings', label: 'Meeting', icon: '🏟️' },
    { path: '/admin/race-conditions', label: 'Race Condition', icon: '📋' },
    { path: '/admin/races', label: 'Race', icon: '🏁' },
    { path: '/admin/prizes', label: 'Giải thưởng', icon: '🏆' },
    { path: '/admin/results', label: 'Kết quả đua', icon: '📈' },
    { path: '/admin/reports', label: 'Báo cáo Referee', icon: '🔍' },
  ],
  [ROLES.STAFF]: [
    { path: '/staff', label: 'Dashboard', icon: '📊' },
    { path: '/staff/invitations', label: 'Lời mời Jockey', icon: '✉️' },
    { path: '/staff/registrations', label: 'Đăng ký', icon: '📝' },
    { path: '/staff/entries', label: 'Quản lý Entry', icon: '✅' },
    { path: '/staff/results', label: 'Kết quả & Công bố', icon: '🏆' },
  ],
  [ROLES.OWNER]: [
    { path: '/owner', label: 'Dashboard', icon: '📊' },
    { path: '/owner/horses', label: 'Ngựa của tôi', icon: '🐎' },
    { path: '/owner/registrations', label: 'Đăng ký đua', icon: '📝' },
    { path: '/owner/races', label: 'Races đang mở', icon: '🏁' },
    { path: '/owner/invitations', label: 'Lời mời Jockey', icon: '✉️' },
  ],
  [ROLES.JOCKEY]: [
    { path: '/jockey', label: 'Dashboard', icon: '📊' },
    { path: '/jockey/invitations', label: 'Lời mời đua', icon: '✉️' },
    { path: '/jockey/races', label: 'Lịch đua của tôi', icon: '🗓️' },
  ],
  [ROLES.REFEREE]: [
    { path: '/referee', label: 'Dashboard', icon: '📊' },
    { path: '/referee/weight-check', label: 'Kiểm tra cân nặng', icon: '⚖️' },
    { path: '/referee/reports', label: 'Báo cáo vi phạm', icon: '📋' },
  ],
  [ROLES.SPECTATOR]: [
    { path: '/spectator', label: 'Dashboard', icon: '📊' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const links = MENU_CONFIG[user.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        {links.map((link) => (
          <NavLink key={link.path} to={link.path} end className="sidebar-link">
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}