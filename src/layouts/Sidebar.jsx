import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import {
  Speedometer2, PeopleFill, CalendarRange, Building, Flag,
  Sliders, Trophy, ClipboardCheck, Envelope, FileEarmarkText,
  CheckSquare, Calendar3, FileEarmarkPlus, PersonHeart,
} from 'react-bootstrap-icons';

const MENU_CONFIG = {
  [ROLES.ADMIN]: [
    {
      label: 'Main',
      items: [
        { path: '/admin', label: 'Dashboard', Icon: Speedometer2 },
        { path: '/admin/users', label: 'Người dùng', Icon: PeopleFill },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { path: '/admin/seasons', label: 'Season', Icon: CalendarRange },
        { path: '/admin/meetings', label: 'Meeting', Icon: Building },
        { path: '/admin/races', label: 'Race', Icon: Flag },
        { path: '/admin/race-conditions', label: 'Race Condition', Icon: Sliders },
      ],
    },
    {
      label: 'Reports',
      items: [
        { path: '/admin/results', label: 'Kết quả đua', Icon: Trophy },
        { path: '/admin/reports', label: 'Báo cáo Referee', Icon: ClipboardCheck },
      ],
    },
  ],
  [ROLES.STAFF]: [
    {
      label: 'Main',
      items: [
        { path: '/staff', label: 'Dashboard', Icon: Speedometer2 },
      ],
    },
    {
      label: 'Operations',
      items: [
        { path: '/staff/invitations', label: 'Lời mời Jockey', Icon: Envelope },
        { path: '/staff/registrations', label: 'Đăng ký', Icon: FileEarmarkText },
        { path: '/staff/entries', label: 'Quản lý Entry', Icon: CheckSquare },
        { path: '/staff/results', label: 'Kết quả & Công bố', Icon: Trophy },
      ],
    },
  ],
  [ROLES.OWNER]: [
    {
      label: 'Main',
      items: [
        { path: '/owner', label: 'Dashboard', Icon: Speedometer2 },
        { path: '/owner/horses', label: 'Ngựa của tôi', Icon: PersonHeart },
      ],
    },
    {
      label: 'Racing',
      items: [
        { path: '/owner/races', label: 'Races đang mở', Icon: Flag },
        { path: '/owner/registrations', label: 'Đăng ký đua', Icon: FileEarmarkPlus },
        { path: '/owner/invitations', label: 'Lời mời Jockey', Icon: Envelope },
      ],
    },
  ],
  [ROLES.JOCKEY]: [
    {
      label: 'Main',
      items: [
        { path: '/jockey', label: 'Dashboard', Icon: Speedometer2 },
        { path: '/jockey/invitations', label: 'Lời mời đua', Icon: Envelope },
        { path: '/jockey/races', label: 'Lịch đua của tôi', Icon: Calendar3 },
      ],
    },
  ],
  [ROLES.REFEREE]: [
    {
      label: 'Main',
      items: [
        { path: '/referee', label: 'Dashboard', Icon: Speedometer2 },
        { path: '/referee/reports', label: 'Báo cáo vi phạm', Icon: ClipboardCheck },
        { path: '/referee/results', label: 'Kết quả đua', Icon: Trophy },
      ],
    },
  ],
  [ROLES.SPECTATOR]: [
    {
      label: 'Main',
      items: [
        { path: '/spectator', label: 'Dashboard', Icon: Speedometer2 },
      ],
    },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const groups = MENU_CONFIG[user.role] || [];

  return (
    <aside className="sidebar">
      {groups.map((group, gi) => (
        <div key={gi} className="sidebar-group">
          <div className="sidebar-group-label">{group.label}</div>
          {group.items.map(({ path, label, Icon }) => (
            <NavLink key={path} to={path} end className="sidebar-link">
              <Icon size={15} className="sidebar-link-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
}
