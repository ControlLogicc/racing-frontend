import api from './api';
import { MOCK_USERS } from '../mocks/mockUsers';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _users = [...MOCK_USERS];
let _nextId = Math.max(..._users.map((u) => u.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._users]),
  getJockeys: () => Promise.resolve(_users.filter((u) => u.role === 'jockey')),
  create: (payload) => {
    const created = { id: _nextId++, locked: false, ...payload };
    _users = [..._users, created];
    return Promise.resolve(created);
  },
  setRole: (id, role) => {
    _users = _users.map((u) => (u.id === id ? { ...u, role } : u));
    return Promise.resolve(_users.find((u) => u.id === id));
  },
  setLocked: (id, locked) => {
    _users = _users.map((u) => (u.id === id ? { ...u, locked } : u));
    return Promise.resolve(_users.find((u) => u.id === id));
  },
};

// ─── Field mapper ─────────────────────────────────────────────────────────────
// Backend JockeyResponse: { jockeyId, userId, fullName, email, weight, experienceYears, status }
// Frontend JSX: { id, fullName, email, ... }
const mapJockey = (j) => ({
  id: j.jockeyId,       // jockeyId → id (dùng khi gửi invitation payload)
  jockeyId: j.jockeyId,
  userId: j.userId,
  fullName: j.fullName,
  email: j.email,
  weight: j.weight,
  experienceYears: j.experienceYears,
  role: 'jockey',       // thêm field role để compatible với code cũ filter u.role === 'jockey'
  locked: false,        // JockeyResponse không có locked field
  status: j.status,
});
const mapJockeys = (list) => (Array.isArray(list) ? list.map(mapJockey) : []);

// StaffResponse: { staffId, userId, fullName, email, ... }
const mapStaff = (s) => ({
  id: s.staffId ?? s.userId,
  staffId: s.staffId,
  userId: s.userId,
  fullName: s.fullName || s.name || `Staff #${s.staffId}`,
  email: s.email,
});
const mapStaffList = (list) => (Array.isArray(list) ? list.map(mapStaff) : []);

// RefereeResponse: { refereeId, userId, fullName, email, ... }
const mapReferee = (r) => ({
  id: r.refereeId ?? r.userId,
  refereeId: r.refereeId,
  userId: r.userId,
  fullName: r.fullName || r.name || `Referee #${r.refereeId}`,
  email: r.email,
});
const mapReferees = (list) => (Array.isArray(list) ? list.map(mapReferee) : []);

const realService = {
  // BACKEND PENDING: GET /admin/users chưa có trong spec (chỉ có POST).
  // Chuyển sang reject để UI hiện lỗi thay vì mảng rỗng khó hiểu.
  getAll: () => Promise.reject(new Error('Chức năng xem danh sách Users chưa được backend hỗ trợ.')),

  // GET /jockeys — danh sách jockey (authenticated, dùng cho Owner mời jockey)
  getJockeys: () => api.get('/jockeys').then((r) => mapJockeys(r.data)),

  // GET /staff — danh sách staff (dùng để admin assign staff vào race)
  getStaff: () => api.get('/staff').then((r) => mapStaffList(r.data)).catch(() => []),

  // GET /referees — danh sách referee (dùng để admin assign referee vào race)
  getReferees: () => api.get('/referees').then((r) => mapReferees(r.data)).catch(() => []),

  // POST /admin/users — tạo tài khoản nội bộ (ADMIN)
  // Backend cần role UPPERCASE (STAFF, REFEREE...) và fullName
  create: ({ fullName, email, password, role, phone }) =>
    api.post('/admin/users', {
      fullName,
      email,
      password,
      role: role ? role.toUpperCase() : 'SPECTATOR',
      phone: phone || '',
    }).then((r) => r.data),

  // Backend chưa có endpoints cho change role/lock
  setRole: () => Promise.reject(new Error('Chức năng đổi role chưa được backend hỗ trợ.')),
  setLocked: () => Promise.reject(new Error('Chức năng khoá tài khoản chưa được backend hỗ trợ.')),
};

export const userService = realService;
