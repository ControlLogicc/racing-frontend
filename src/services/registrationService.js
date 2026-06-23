import api from './api';
import { MOCK_REGISTRATIONS } from '../mocks/mockRegistrations';
import { RACE_REGISTRATION_STATUS } from '../constants/status';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let mockStore = [...MOCK_REGISTRATIONS];
let nextId = mockStore.length + 1;

const mockService = {
  getAll: () => Promise.resolve([...mockStore]),
  getByOwner: (ownerId) => Promise.resolve(mockStore.filter((r) => r.ownerId === ownerId)),
  create: (payload) => {
    const created = {
      id: nextId++,
      status: RACE_REGISTRATION_STATUS.SUBMITTED,
      submittedAt: new Date().toISOString(),
      ...payload,
    };
    mockStore = [...mockStore, created];
    return Promise.resolve(created);
  },
  cancel: (id) => {
    mockStore = mockStore.map((r) =>
      r.id === id ? { ...r, status: RACE_REGISTRATION_STATUS.CANCELLED } : r
    );
    return Promise.resolve(mockStore.find((r) => r.id === id));
  },
};

// ─── Field mapper ─────────────────────────────────────────────────────────────
// Backend RegistrationResponse: { registrationId, raceId, raceName, horseId, horseName,
//   ownerId, ownerName, status, submittedAt }
// Frontend JSX dùng: { id, ... } — map registrationId → id
const mapReg = (r) => ({
  id: r.registrationId,
  registrationId: r.registrationId,
  raceId: r.raceId,
  raceName: r.raceName,
  horseId: r.horseId,
  horseName: r.horseName,
  ownerId: r.ownerId,
  ownerName: r.ownerName,
  status: r.status || r.registrationStatus,
  submittedAt: r.submittedAt,
  reviewedAt: r.reviewedAt,
  canInviteJockey: r.canInviteJockey,
});
const mapRegs = (list) => (Array.isArray(list) ? list.map(mapReg) : []);

// ─── Real API (VITE_USE_MOCK=false) ───────────────────────────────────────────
const realService = {
  // Lấy các đăng ký đã duyệt của Owner (dùng cho việc mời Jockey)
  getApprovedByOwner: () => api.get('/owner/registrations/approved').then((r) => mapRegs(r.data)).catch(() => []),

  // Owner lấy toàn bộ danh sách Đăng ký của mình (Lịch sử)
  // Backend thiếu API GET /owner/registrations, nên ta kết hợp API approved và dữ liệu từ invitations
  getByOwner: async () => {
    try {
      // Lấy danh sách đã duyệt
      const approved = await api.get('/owner/registrations/approved').then(r => r.data).catch(() => []);
      
      // Lấy danh sách từ invitations (để khôi phục những đăng ký pending/rejected nhưng có lời mời cũ, nếu có)
      const invs = await api.get('/invitations').then(r => r.data).catch(() => []);
      
      const seen = new Map();
      
      // Thêm các đăng ký đã duyệt vào Map
      if (Array.isArray(approved)) {
        for (const reg of approved) {
          seen.set(reg.registrationId, mapReg(reg));
        }
      }
      
      // Thêm các đăng ký từ invitations vào Map (nếu chưa có)
      if (Array.isArray(invs)) {
        for (const inv of invs) {
          const rid = inv.raceRegistrationId || inv.registrationId;
          if (!rid) continue;
          if (!seen.has(rid)) {
            seen.set(rid, mapReg({
              registrationId: rid,
              raceId: inv.raceId,
              raceName: inv.raceName,
              horseId: inv.horseId,
              horseName: inv.horseName,
              ownerId: inv.ownerId,
              ownerName: inv.ownerName,
              status: inv.registrationStatus || 'APPROVED', // fallback
              submittedAt: inv.submittedAt || inv.sentAt,
            }));
          }
        }
      }
      return Array.from(seen.values());
    } catch {
      return [];
    }
  },

  // Staff xem registrations cho race được gán — BE trả thêm canApprove/canReject
  getAll: (params) => api.get('/staff/registrations', { params }).then((r) => mapRegs(r.data)),
  // Admin/Staff xem theo race cụ thể
  getByRace: (raceId) => api.get(`/registrations/race/${raceId}`).then((r) => mapRegs(r.data)),

  // Owner tạo đăng ký: { raceId, horseId }
  create: (payload) => api.post('/registrations', payload).then((r) => mapReg(r.data)),

  // Staff/Admin duyệt / từ chối
  approve: (id) => api.put(`/registrations/${id}/approve`).then((r) => mapReg(r.data)),
  reject: (id) => api.put(`/registrations/${id}/reject`).then((r) => mapReg(r.data)),

  // Owner huỷ đăng ký
  cancel: () => Promise.reject(new Error('Chức năng huỷ đăng ký chưa được backend hỗ trợ.')),
};

export const registrationService = USE_MOCK ? mockService : realService;
