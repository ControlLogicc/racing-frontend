// Giá trị role khớp đúng cột USER.role trong ERD (chữ thường)
export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  REFEREE: 'referee',
  OWNER: 'owner',
  JOCKEY: 'jockey',
  SPECTATOR: 'spectator',
};

// Trang chủ sau khi đăng nhập theo role
export const HOME_ROUTE_BY_ROLE = {
  [ROLES.ADMIN]: '/admin/users',
  [ROLES.STAFF]: '/staff',
  [ROLES.REFEREE]: '/referee/reports',
  [ROLES.OWNER]: '/owner/horses',
  [ROLES.JOCKEY]: '/jockey/invitations',
  [ROLES.SPECTATOR]: '/spectator',
};

// Chỉ các role này được tự đăng ký qua form public
export const SELF_REGISTER_ROLES = [ROLES.OWNER, ROLES.SPECTATOR];