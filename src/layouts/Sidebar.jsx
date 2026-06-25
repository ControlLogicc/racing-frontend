import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import { 
  Speedometer2, PeopleFill, Calendar3, MapFill, Building, 
  UiChecksGrid, FlagFill, TrophyFill, GraphUpArrow, 
  EnvelopePaperFill, PencilSquare, CheckCircleFill, ExclamationTriangleFill,
  LightningChargeFill, Search
} from 'react-bootstrap-icons';

// Cấu hình danh sách Menu, ánh xạ theo từng role (lấy UI từ file layout cũ của bạn)
const MENU_CONFIG = {
  [ROLES.ADMIN]: [
    { path: '/admin', label: 'Dashboard', icon: <Speedometer2 /> },
    { path: '/admin/users', label: 'Người dùng', icon: <PeopleFill /> },
    { path: '/admin/seasons', label: 'Season', icon: <Calendar3 /> },
    { path: '/admin/racecourses', label: 'Đường đua', icon: <MapFill /> },
    { path: '/admin/meetings', label: 'Meeting', icon: <Building /> },
    { path: '/admin/race-conditions', label: 'Race Condition', icon: <UiChecksGrid /> },
    { path: '/admin/races', label: 'Race', icon: <FlagFill /> },
    { path: '/admin/prizes', label: 'Giải thưởng', icon: <TrophyFill /> },
    { path: '/admin/results', label: 'Kết quả đua', icon: <GraphUpArrow /> },
    { path: '/admin/reports', label: 'Báo cáo Referee', icon: <Search /> },
  ],
  [ROLES.STAFF]: [
    { path: '/staff', label: 'Dashboard', icon: <Speedometer2 /> },
    { path: '/staff/races', label: 'Races của tôi', icon: <FlagFill /> },
  ],
  [ROLES.OWNER]: [
    { path: '/owner', label: 'Dashboard', icon: <Speedometer2 /> },
    { path: '/owner/horses', label: 'Ngựa của tôi', icon: <LightningChargeFill /> },
    { path: '/owner/registrations', label: 'Đăng ký đua', icon: <PencilSquare /> },
    { path: '/owner/races', label: 'Races đang mở', icon: <FlagFill /> },
    { path: '/owner/invitations', label: 'Lời mời Jockey', icon: <EnvelopePaperFill /> },
  ],
  [ROLES.JOCKEY]: [
    { path: '/jockey', label: 'Dashboard', icon: <Speedometer2 /> },
    { path: '/jockey/invitations', label: 'Lời mời đua', icon: <EnvelopePaperFill /> },
    { path: '/jockey/races', label: 'Lịch đua của tôi', icon: <Calendar3 /> },
  ],
  [ROLES.REFEREE]: [
    { path: '/referee', label: 'Dashboard', icon: <Speedometer2 /> },
    { path: '/referee/checks', label: 'Kiểm tra trước đua', icon: <CheckCircleFill /> },
    { path: '/referee/reports', label: 'Báo cáo vi phạm', icon: <ExclamationTriangleFill /> },
    { path: '/referee/results', label: 'Kết quả đua', icon: <TrophyFill /> },
  ],
  [ROLES.SPECTATOR]: [
    { path: '/spectator', label: 'Dashboard', icon: <Speedometer2 /> },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  
  if (!user) return null;

  const links = MENU_CONFIG[user.role] || [];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', padding: '10px 15px', borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: 'transparent', border: 'none', color: '#d4af37', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? '❯' : '❮'}
        </button>
      </div>
      <div className="sidebar-menu" style={{ marginTop: '10px' }}>
        {links.map((link) => (
          <NavLink key={link.path} to={link.path} end className="sidebar-link" title={collapsed ? link.label : ''}>
            <span className="sidebar-icon">{link.icon}</span>
            <span className="sidebar-label">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
