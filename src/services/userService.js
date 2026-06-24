import api from './api';
import { MOCK_USERS } from '../mocks/mockUsers';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _users = [...MOCK_USERS];
let _nextId = Math.max(..._users.map((u) => u.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._users]),
  getJockeys: () => Promise.resolve(_users.filter((u) => u.role === 'jockey')),
<<<<<<< HEAD
  getStaff: () => Promise.resolve(
    _users
      .filter((u) => u.role === 'staff')
      .map((u) => ({ ...u, id: u.staffId ?? u.id, staffId: u.staffId ?? u.id })),
  ),
  getReferees: () => Promise.resolve(
    _users
      .filter((u) => u.role === 'referee')
      .map((u) => ({ ...u, id: u.refereeId ?? u.id, refereeId: u.refereeId ?? u.id })),
  ),
=======
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
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
<<<<<<< HEAD
  staffCode: s.staffCode,
  department: s.department,
  status: s.status,
});
const mapStaffList = (data) => {
  if (Array.isArray(data)) return data.map(mapStaff).filter((s) => s.staffId);
  if (data && typeof data === 'object') return [mapStaff(data)].filter((s) => s.staffId);
  return [];
};
=======
});
const mapStaffList = (list) => (Array.isArray(list) ? list.map(mapStaff) : []);
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8

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
<<<<<<< HEAD
  // Return [] để UsersPage không crash — admin vẫn dùng được form tạo user.
  getAll: () => api.get('/admin/users').then((r) => (Array.isArray(r.data) ? r.data : [])).catch(() => []),
=======
  // Chuyển sang reject để UI hiện lỗi thay vì mảng rỗng khó hiểu.
  getAll: () => Promise.reject(new Error('Chức năng xem danh sách Users chưa được backend hỗ trợ.')),
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8

  // GET /jockeys — danh sách jockey (authenticated, dùng cho Owner mời jockey)
  getJockeys: () => api.get('/jockeys').then((r) => mapJockeys(r.data)),

<<<<<<< HEAD
  // Staff profiles are required here because RaceRequest.staffId expects Staff.staffId, not User.userId.
  getStaff: async () => {
    try {
      const data = await api.get('/staff/all').then((r) => r.data);
      const staff = mapStaffList(data);
      if (staff.length) return staff;
    } catch {
      // Try the broader /staff endpoint below. For ADMIN it returns all staff profiles.
    }

    try {
      const data = await api.get('/staff').then((r) => r.data);
      return mapStaffList(data);
    } catch {
      return [];
    }
  },
=======
  // GET /staff — danh sách staff (dùng để admin assign staff vào race)
  getStaff: () => api.get('/staff').then((r) => mapStaffList(r.data)).catch(() => []),
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8

  // GET /referees — danh sách referee (dùng để admin assign referee vào race)
  getReferees: () => api.get('/referees').then((r) => mapReferees(r.data)).catch(() => []),

<<<<<<< HEAD
  create: ({ fullName, email, password, role, phone, staffCode, department, licenseNo, weight, experienceYears }) => {
    const normalizedRole = role ? role.toUpperCase() : 'SPECTATOR';
    const payload = {
      fullName,
      email,
      password,
      role: normalizedRole,
      phone: phone || '',
      staffCode: staffCode || null,
      department: department || null,
      position: department || null,
      licenseNo: licenseNo || null,
      licenseNumber: licenseNo || null,
      weight: weight ? parseFloat(weight) : null,
      experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,
    };

    if (['STAFF', 'JOCKEY', 'REFEREE'].includes(normalizedRole)) {
      return api.post('/admin/internal-accounts', payload).then((r) => r.data);
    }

    return api.post('/admin/users', payload).then((r) => r.data);
  },
=======
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
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8

  // Backend chưa có endpoints cho change role/lock
  setRole: () => Promise.reject(new Error('Chức năng đổi role chưa được backend hỗ trợ.')),
  setLocked: () => Promise.reject(new Error('Chức năng khoá tài khoản chưa được backend hỗ trợ.')),
};

<<<<<<< HEAD
export const userService = USE_MOCK ? mockService : realService;
=======
export const userService = realService;
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
