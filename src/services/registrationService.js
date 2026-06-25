import api from './api';
import { MOCK_REGISTRATIONS } from '../mocks/mockRegistrations';
import { RACE_REGISTRATION_STATUS } from '../constants/status';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let mockStore = [...MOCK_REGISTRATIONS];
let nextId = mockStore.length + 1;

const mockService = {
  getAll: () => Promise.resolve([...mockStore]),
  getByOwner: (ownerId) => {
    let uid = ownerId;
    if (!uid) {
      try {
        const u = JSON.parse(localStorage.getItem('user'));
        uid = u?.userId || u?.id;
      } catch {}
    }
    return Promise.resolve(mockStore.filter((r) => Number(r.ownerId) === Number(uid)));
  },
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
  status: r.registrationStatus ?? r.status,
  submittedAt: r.submittedAt,
  reviewedAt: r.reviewedAt,
  registrationCloseAt: r.registrationCloseAt,
  scheduledTime: r.scheduledTime,
  invitationId: r.invitationId,
  invitationStatus: r.invitationStatus,
  entryId: r.entryId,
  canInviteJockey: r.canInviteJockey,
});
const mapRegs = (list) => (Array.isArray(list) ? list.map(mapReg) : []);

// ─── Real API (VITE_USE_MOCK=false) ───────────────────────────────────────────
const realService = {
  // Owner xem đăng ký của mình (đã APPROVED để mời jockey)
  getByOwner: () => 
    api.get('/owner/registrations/approved')
       .then((r) => mapRegs(r.data))
       .catch(() => []),

  // Staff xem registrations cho race được gán — BE trả thêm canApprove/canReject
  getAll: (params) => api.get('/staff/registrations', { params }).then((r) => mapRegs(r.data)),
  // Admin/Staff xem theo race cụ thể
  getByRace: (raceId) => api.get(`/registrations/${raceId}`).then((r) => mapRegs(r.data)),

  // Owner tạo đăng ký: { raceId, horseId }
  create: (payload) => 
    api.post('/registrations', {
      raceId: Number(payload.raceId),
      horseId: Number(payload.horseId),
    }).then((r) => mapReg(r.data)),

  // Staff/Admin duyệt / từ chối
  approve: (id) => api.put(`/registrations/${id}/approve`).then((r) => mapReg(r.data)),
  reject: (id) => api.put(`/registrations/${id}/reject`).then((r) => mapReg(r.data)),

  // Owner huỷ đăng ký
  cancel: (id) => api.patch(`/registrations/${id}/cancel`).then((r) => mapReg(r.data)),
};

export const registrationService = USE_MOCK ? mockService : realService;
