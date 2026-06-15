import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {
  House, People, Flag, ClipboardCheck, FileEarmarkText, Trophy, Envelope, Calendar,
} from 'react-bootstrap-icons';
import { useAuth } from '../hooks/useAuth';

// Menu khác nhau theo role (có thể tách ra constants/ sau)
const MENU_BY_ROLE = {
  admin: [
    { to: '/admin/users', label: 'Quản lý User', Icon: People },
  ],
  staff: [
    { to: '/staff/races', label: 'Races', Icon: Flag },
    { to: '/staff/registrations', label: 'Duyệt đăng ký', Icon: ClipboardCheck },
  ],
  referee: [
    { to: '/referee/reports', label: 'Báo cáo', Icon: FileEarmarkText },
    { to: '/referee/results', label: 'Nhập kết quả', Icon: Trophy },
  ],
  owner: [
    { to: '/owner/horses', label: 'Ngựa của tôi', Icon: Flag },
    { to: '/owner/registrations', label: 'Đăng ký đua', Icon: ClipboardCheck },
    { to: '/owner/invitations', label: 'Mời jockey', Icon: Envelope },
  ],
  jockey: [
    { to: '/jockey/invitations', label: 'Lời mời', Icon: Envelope },
    { to: '/jockey/schedule', label: 'Lịch đua', Icon: Calendar },
  ],
  spectator: [
    { to: '/', label: 'Trang chủ', Icon: House },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const items = MENU_BY_ROLE[user?.role] || []; // lọc theo role

  return (
    <div className="bg-dark text-light p-3" style={{ width: 240, minHeight: 'calc(100vh - 56px)' }}>
      <div className="text-uppercase small text-warning mb-2">Menu · {user?.role}</div>
      <Nav className="flex-column">
        {items.map(({ to, label, Icon }) => (
          <Nav.Link
            key={to}
            as={NavLink}
            to={to}
            end
            className="text-light d-flex align-items-center gap-2 rounded mb-1"
          >
            <Icon /> {label}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
}