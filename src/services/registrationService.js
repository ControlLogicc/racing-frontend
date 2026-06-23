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
  status: r.status,
  submittedAt: r.submittedAt,
  reviewedAt: r.reviewedAt,
});
const mapRegs = (list) => (Array.isArray(list) ? list.map(mapReg) : []);

// ─── Real API (VITE_USE_MOCK=false) ───────────────────────────────────────────
const realService = {
  // Owner xem đăng ký của mình.
  // BE không có GET /owner/registrations — derive từ invitations.
  // Limitation: registrations chưa gửi invitation nào sẽ không hiện.
  // → Yêu cầu BE thêm endpoint GET /owner/registrations để fix hoàn toàn.
  getByOwner: async () => {
    try {
      const invs = await api.get('/invitations').then((r) => r.data);
      if (!Array.isArray(invs) || invs.length === 0) return [];
      const seen = new Map(); // registrationId → registration object
      for (const inv of invs) {
        const rid = inv.raceRegistrationId;
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
            // registrationStatus không có trong invitation response
            // nếu registration có invitation thì đã được duyệt (APPROVED)
            status: inv.registrationStatus || 'APPROVED',
            submittedAt: inv.submittedAt || inv.sentAt,
          }));
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
  cancel: (id) => api.patch(`/registrations/${id}/cancel`).then((r) => mapReg(r.data)),
};

export const registrationService = USE_MOCK ? mockService : realService;
