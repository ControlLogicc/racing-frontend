import api from './api';
import { MOCK_HORSES } from '../mocks/mockHorses';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ─── Mock (VITE_USE_MOCK=true) ────────────────────────────────────────────────
let mockStore = [...MOCK_HORSES];
let nextId = mockStore.length + 1;

const mockService = {
  // Trả toàn bộ danh sách (không filter ownerId) để luôn thấy data khi test
  getAll: () => Promise.resolve([...mockStore]),
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

// ─── Real API (VITE_USE_MOCK=false) ───────────────────────────────────────────
// Shape mong đợi từ backend: { id, name, age, breed, ownerId, ownerName }
// Nếu backend trả field khác → sửa ở đây, KHÔNG sửa trong JSX
const realService = {
  getAll: (params) => api.get('/horses', { params }).then((r) => r.data),
  getById: (id) => api.get(`/horses/${id}`).then((r) => r.data),
  getByOwner: (ownerId) => api.get('/horses', { params: { ownerId } }).then((r) => r.data),
  create: (payload) => api.post('/horses', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/horses/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/horses/${id}`).then((r) => r.data),
};

export const horseService = USE_MOCK ? mockService : realService;
