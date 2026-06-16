// src/constants/roles.js
// Nguồn chân lý duy nhất cho role + menu sidebar theo role.
// 1 user = 1 role (giá trị đơn, chữ thường) — theo FRONTEND_AI_RULES Mục 4.

export const ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  JOCKEY: 'jockey',
  REFEREE: 'referee',
  HANDICAPPER: 'handicapper',
  SPECTATOR: 'spectator',
};

// Nhãn hiển thị đẹp cho từng role (dùng ở Header / badge).
export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.OWNER]: 'Horse Owner',
  [ROLES.JOCKEY]: 'Jockey',
  [ROLES.REFEREE]: 'Referee',
  [ROLES.HANDICAPPER]: 'Handicapper',
  [ROLES.SPECTATOR]: 'Spectator',
};

// Trang chủ mặc định sau khi đăng nhập theo role.
export const HOME_ROUTE_BY_ROLE = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.OWNER]: '/owner',
  [ROLES.JOCKEY]: '/jockey',
  [ROLES.REFEREE]: '/referee',
  [ROLES.HANDICAPPER]: '/handicapper',
  [ROLES.SPECTATOR]: '/spectator',
};

// Menu sidebar theo từng role. Sidebar chỉ render đúng menu của role hiện tại.
// `end: true` để NavLink chỉ active khi đúng path tuyệt đối (tránh Dashboard luôn active).
export const ROLE_MENUS = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', to: '/admin', icon: '📊', end: true },
    { label: 'Users', to: '/admin/users', icon: '👥' },
    { label: 'Seasons', to: '/admin/seasons', icon: '📅' },
    { label: 'Meetings', to: '/admin/meetings', icon: '🏟️' },
    { label: 'Races', to: '/admin/races', icon: '🏁' },
  ],
  [ROLES.OWNER]: [
    { label: 'Dashboard', to: '/owner', icon: '📊', end: true },
    { label: 'My Horses', to: '/owner/horses', icon: '🐎' },
    { label: 'Race Registrations', to: '/owner/registrations', icon: '📝' },
    { label: 'Jockey Invitations', to: '/owner/invitations', icon: '✉️' },
  ],
  [ROLES.JOCKEY]: [
    { label: 'Dashboard', to: '/jockey', icon: '📊', end: true },
    { label: 'Invitations', to: '/jockey/invitations', icon: '✉️' },
    { label: 'My Race Schedule', to: '/jockey/races', icon: '🗓️' },
  ],
  [ROLES.REFEREE]: [
    { label: 'Dashboard', to: '/referee', icon: '📊', end: true },
    { label: 'Assigned Races', to: '/referee/races', icon: '🏁' },
    { label: 'Race Review / Pre-check', to: '/referee/pre-check', icon: '🔍' },
    { label: 'Results', to: '/referee/results', icon: '🏆' },
    { label: 'Reports', to: '/referee/reports', icon: '📋' },
  ],
  [ROLES.HANDICAPPER]: [
    { label: 'Dashboard', to: '/handicapper', icon: '📊', end: true },
    { label: 'Assigned Races', to: '/handicapper/races', icon: '🏁' },
    { label: 'Handicap Weights', to: '/handicapper/weights', icon: '⚖️' },
  ],
  [ROLES.SPECTATOR]: [
    { label: 'Dashboard', to: '/spectator', icon: '📊', end: true },
    { label: 'Race Schedule', to: '/schedule', icon: '🗓️' },
    { label: 'Rankings', to: '/ranking', icon: '🏆' },
    { label: 'Horse Profiles', to: '/horses', icon: '🐎' },
  ],
};

// Chuẩn hoá role về chữ thường + gom alias (data hiện tại đang lệch:
// có chỗ 'ADMIN' HOA, Register lại dùng 'horse_owner'). Nhờ vậy guard/sidebar
// vẫn hoạt động dù backend trả hoa hay thường.
export const normalizeRole = (rawRole) => {
  if (!rawRole) return '';
  const r = String(rawRole).trim().toLowerCase();
  if (r === 'horse_owner' || r === 'horseowner') return ROLES.OWNER;
  return r;
};