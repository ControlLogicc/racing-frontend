import api from './api';
import { MOCK_USERS } from '../mocks/mockUsers';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _users = [...MOCK_USERS];
let _nextId = Math.max(..._users.map((u) => u.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._users]),
  getJockeys: () => Promise.resolve(_users.filter((u) => u.role === 'jockey')),
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
  create: (payload) => {
    const created = { id: _nextId++, locked: false, ...payload };
    _users = [..._users, created];
    return Promise.resolve(created);
  },
  setRole: (id, role) => {
    _users = _users.map((u) => (u.id === id ? { ...u, role } : u));
    return Promise.resolve(_users.find((u) => u.id === id));
  },
  banUser: (id, reason) => {
    _users = _users.map((u) => (u.id === id ? { ...u, accountStatus: 'banned', bannedReason: reason, bannedAt: new Date().toISOString() } : u));
    return Promise.resolve(_users.find((u) => u.id === id));
  },
  unbanUser: (id) => {
    _users = _users.map((u) => (u.id === id ? { ...u, accountStatus: 'active', bannedReason: null, bannedAt: null } : u));
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
  height: j.height,
  nationality: j.nationality,
  licenseNumber: j.licenseNumber,
  achievements: j.achievements,
  imageUrl: j.imageUrl,
  dateOfBirth: j.dateOfBirth,
  role: 'jockey',       // thêm field role để compatible với code cũ filter u.role === 'jockey'
  locked: false,        // JockeyResponse không có locked field
  status: j.status,
});
const mapJockeys = (list) => (Array.isArray(list) ? list.map(mapJockey) : []);

// StaffResponse: { staffId, userId, fullName, email, ... }
// InternalAccountResponse: { userId, profileId, role, fullName, email, status }
const mapStaff = (s) => ({
  id: s.staffId ?? s.profileId ?? s.id ?? s.userId,
  staffId: s.staffId ?? s.profileId ?? s.id,
  userId: s.userId,
  fullName: s.fullName || s.name || `Staff #${s.staffId ?? s.profileId ?? s.id ?? s.userId}`,
  email: s.email,
  staffCode: s.staffCode,
  department: s.department,
  status: s.status,
});
const mapStaffList = (data) => {
  const isStaffRecord = (item) => {
    const role = String(item?.role ?? '').toUpperCase();
    return !role || role === 'STAFF';
  };
  if (Array.isArray(data)) return data.filter(isStaffRecord).map(mapStaff).filter((s) => s.staffId);
  if (data && typeof data === 'object' && isStaffRecord(data)) return [mapStaff(data)].filter((s) => s.staffId);
  return [];
};

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
  // GET /admin/users — trả về UserResponse[] gồm cả accountStatus/bannedReason/bannedAt/bannedBy
  getAll: () => api.get('/admin/users').then((r) => (Array.isArray(r.data) ? r.data : [])).catch(() => []),

  // GET /jockeys — danh sách jockey (authenticated, dùng cho Owner mời jockey)
  getJockeys: () => api.get('/jockeys').then((r) => mapJockeys(r.data)),

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
      const staff = mapStaffList(data);
      if (staff.length) return staff;
    } catch {
      // Some backends restrict /staff to the logged-in staff profile only.
    }

    try {
      const data = await api.get('/admin/users').then((r) => r.data);
      return mapStaffList(data);
    } catch {
      return [];
    }
  },

  // GET /referees — danh sách referee (dùng để admin assign referee vào race)
  getReferees: () => api.get('/referees').then((r) => mapReferees(r.data)).catch(() => []),

  create: ({
    fullName, email, password, role, phone, staffCode, department, licenseNo, weight, experienceYears,
    height, nationality, jockeyLicenseNumber, achievements, imageUrl, dateOfBirth,
  }) => {
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
      // Referee dùng licenseNo; Jockey dùng jockeyLicenseNumber — 2 khái niệm khác nhau, không dùng chung 1 field.
      licenseNumber: normalizedRole === 'JOCKEY' ? (jockeyLicenseNumber || null) : (licenseNo || null),
      weight: weight ? parseFloat(weight) : null,
      experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,
      height: height ? parseFloat(height) : null,
      nationality: nationality || null,
      achievements: achievements || null,
      imageUrl: imageUrl || null,
      dateOfBirth: dateOfBirth || null,
    };

    if (['STAFF', 'JOCKEY', 'REFEREE'].includes(normalizedRole)) {
      return api.post('/admin/internal-accounts', payload).then((r) => r.data);
    }

    return api.post('/admin/users', payload).then((r) => r.data);
  },

  // Backend chưa có endpoint đổi role
  setRole: () => Promise.reject(new Error('Chức năng đổi role chưa được backend hỗ trợ.')),

  // PUT /admin/users/{id}/ban { reason } — ADMIN, không tự ban chính mình (BE chặn 400)
  banUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }).then((r) => r.data),
  // PUT /admin/users/{id}/unban — ADMIN
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`).then((r) => r.data),
};

export const userService = USE_MOCK ? mockService : realService;
