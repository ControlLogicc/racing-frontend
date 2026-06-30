import api from './api';
import { MOCK_HORSES } from '../mocks/mockHorses';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ─── Mock (VITE_USE_MOCK=true) ────────────────────────────────────────────────
let mockStore = [...MOCK_HORSES];
let nextId = mockStore.length + 1;

const mockService = {
  getAll: () => Promise.resolve([...mockStore]),
  getPublicAll: () => Promise.resolve([...mockStore]),
  getById: (id) => Promise.resolve(mockStore.find((h) => h.id === id) ?? null),
  getByOwner: () => Promise.resolve([...mockStore]),
  create: (payload) => {
    const created = { id: nextId++, ...payload };
    mockStore = [...mockStore, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    mockStore = mockStore.map((h) => (h.id === id ? { ...h, ...payload } : h));
    return Promise.resolve(mockStore.find((h) => h.id === id));
  },
  remove: (id) => {
    mockStore = mockStore.filter((h) => h.id !== id);
    return Promise.resolve({ success: true });
  },
};

// ─── Field mapper: HorseResponse (backend) → horse shape (frontend JSX dùng) ──
// Backend: { horseId, horseName, color, age, gender, currentScore, horseClass, ownerId, ownerName }
// Frontend JSX dùng: { id, name, age, breed, rating, ownerId, ownerName }
const mapHorse = (h) => ({
  id: h.horseId,
  name: h.horseName,
  age: h.age,
  breed: h.color,           // color → breed (hiển thị giống/màu)
  gender: h.gender,
  healthNote: h.healthNote,
  rating: h.currentScore,   // currentScore → rating (official)
  horseClass: h.horseClass,
  status: h.status,
  ownerId: h.ownerId,
  ownerName: h.ownerName,
  totalWins: h.totalWins,
  registrationType: h.registrationType,
  ratingVerified: h.ratingVerified,
  ratingVerifiedAt: h.ratingVerifiedAt,
  claimedScore: h.claimedScore,   // Rating chủ ngựa khai báo (chờ duyệt)
  claimedClass: h.claimedClass,   // Class chủ ngựa khai báo
  evidenceLink: h.evidenceLink,   // Link bằng chứng (PREVIOUSLY_REGISTERED)
});
const mapHorses = (list) => (Array.isArray(list) ? list.map(mapHorse) : []);

// ─── Real API (VITE_USE_MOCK=false) ───────────────────────────────────────────
const realService = {
  // Owner: chỉ thấy ngựa của mình (JWT xác định owner)
  getAll: () => api.get('/owner/horses').then((r) => mapHorses(r.data)),
  getByOwner: () => api.get('/owner/horses').then((r) => mapHorses(r.data)),
  getById: (id) => api.get(`/owner/horses/${id}`).then((r) => mapHorse(r.data)),

  // Payload tạo ngựa: { horseName, color, age, gender, healthNote, registrationType, claimedScore, claimedClass }
  create: ({ name, horseName, age, breed, color, gender, healthNote, registrationType, claimedScore, evidenceLink }) =>
    api.post('/owner/horses', {
      horseName: horseName || name,
      color: color || breed || '',
      age: Number(age),
      gender: gender || 'M',
      healthNote: healthNote || '',
      registrationType: registrationType || 'NEW',
      ...(registrationType === 'PREVIOUSLY_REGISTERED' && {
        claimedScore: Number(claimedScore),
        evidenceLink: evidenceLink || '',
      })
    }).then((r) => mapHorse(r.data)),

  update: (id, { name, horseName, age, breed, color, gender, healthNote, status }) =>
    api.put(`/owner/horses/${id}`, {
      horseName: horseName || name,
      color: color || breed || '',
      age: Number(age),
      gender: gender || 'M',
      healthNote: healthNote || '',
      status: status || 'ACTIVE',
    }).then((r) => mapHorse(r.data)),

  remove: (id) => api.delete(`/owner/horses/${id}`).then((r) => r.data),

  // Spectator / public: thử /horses (nếu có), fallback []
  getPublicAll: () => api.get('/admin/horses').then((r) => mapHorses(r.data)).catch(() => []),
  getPublicById: (id) => api.get(`/admin/horses/${id}`).then((r) => mapHorse(r.data)),

  // Admin/Staff: quản lý toàn bộ ngựa
  adminGetAll: (params) => api.get('/admin/horses', { params }).then((r) => mapHorses(r.data)),
  adminGetById: (id) => api.get(`/admin/horses/${id}`).then((r) => mapHorse(r.data)),
  adminCreate: (payload) => api.post('/admin/horses', payload).then((r) => mapHorse(r.data)),
  adminUpdate: (id, payload) => api.put(`/admin/horses/${id}`, payload).then((r) => mapHorse(r.data)),
  adminRemove: (id) => api.delete(`/admin/horses/${id}`).then((r) => r.data),

  // Staff: Lấy danh sách ngựa chờ duyệt rating (PREVIOUSLY_REGISTERED, ratingVerified=false)
  staffGetPending: () => api.get('/staff/horses/pending').then((r) => mapHorses(r.data)),

  // Staff: Verify/Reject Horse Rating
  verifyRating: (id, action = 'APPROVE', payload = {}) => {
    if (action === 'REJECT') {
      return api.put(`/staff/horses/${id}/reject-rating`).then((r) => mapHorse(r.data));
    }
    return api.put(`/staff/horses/${id}/verify-rating`, payload).then((r) => mapHorse(r.data));
  },
};

export const horseService = USE_MOCK ? mockService : realService;
