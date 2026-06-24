import api from './api';
import { MOCK_REGISTRATIONS } from '../mocks/mockRegistrations';
import { RACE_REGISTRATION_STATUS } from '../constants/status';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let mockStore = [...MOCK_REGISTRATIONS];
let nextId = mockStore.length + 1;

const mockService = {
  getAll: () => Promise.resolve([...mockStore]),
<<<<<<< HEAD
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
=======
  getByOwner: (ownerId) => Promise.resolve(mockStore.filter((r) => r.ownerId === ownerId)),
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
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
<<<<<<< HEAD
  getByOwner: () => api.get('/registrations').then((r) => mapRegs(r.data)),
=======
  // BE Server cũ KHÔNG CÓ GET /registrations/my -> Bị lỗi 400.
  // Giải pháp tạm thời: Lấy danh sách registrations dựa vào danh sách invitations.
  // Nhược điểm: Đăng ký nào chưa từng có invitation (chưa mời Jockey) sẽ KHÔNG hiện lên màn hình.
  getByOwner: () => api.get('/registrations/my').then((r) => mapRegs(r.data)).catch(() => []),
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8

  // Staff xem registrations cho race được gán — BE trả thêm canApprove/canReject
  getAll: (params) => api.get('/staff/registrations', { params }).then((r) => mapRegs(r.data)),
  // Admin/Staff xem theo race cụ thể
<<<<<<< HEAD
  getByRace: (raceId) => api.get(`/registrations/${raceId}`).then((r) => mapRegs(r.data)),
=======
  getByRace: (raceId) => api.get(`/registrations/race/${raceId}`).then((r) => mapRegs(r.data)),
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8

  // Owner tạo đăng ký: { raceId, horseId }
  create: (payload) => api.post('/registrations', payload).then((r) => mapReg(r.data)),

  // Staff/Admin duyệt / từ chối
  approve: (id) => api.put(`/registrations/${id}/approve`).then((r) => mapReg(r.data)),
  reject: (id) => api.put(`/registrations/${id}/reject`).then((r) => mapReg(r.data)),

  // Owner huỷ đăng ký
<<<<<<< HEAD
  cancel: (id) => api.patch(`/registrations/${id}/cancel`).then((r) => mapReg(r.data)),
=======
  cancel: () => Promise.reject(new Error('Chức năng huỷ đăng ký chưa được backend hỗ trợ.')),
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
};

export const registrationService = USE_MOCK ? mockService : realService;
