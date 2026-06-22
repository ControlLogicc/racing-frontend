import api from './api';
import { MOCK_STAFF_PROFILES } from '../mocks/mockStaffProfiles';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _profiles = [...MOCK_STAFF_PROFILES];
let _nextId = Math.max(..._profiles.map((p) => p.id)) + 1;

const mockService = {
  getByUser: (userId) => Promise.resolve(_profiles.find((p) => p.userId === userId) ?? null),
  create: (payload) => {
    const created = { id: _nextId++, ...payload };
    _profiles = [..._profiles, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    _profiles = _profiles.map((p) => (p.id === id ? { ...p, ...payload } : p));
    return Promise.resolve(_profiles.find((p) => p.id === id));
  },
};

const realService = {
  getByUser: (userId) => api.get('/staff-profiles', { params: { userId } }).then((r) => r.data?.[0] ?? null),
  create: (payload) => api.post('/staff-profiles', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/staff-profiles/${id}`, payload).then((r) => r.data),
};

export const staffProfileService = USE_MOCK ? mockService : realService;
