import api from './api';
import { MOCK_JOCKEY_PROFILES } from '../mocks/mockJockeyProfiles';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _profiles = [...MOCK_JOCKEY_PROFILES];
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
  getByUser: (userId) => api.get('/jockey-profiles', { params: { userId } }).then((r) => r.data?.[0] ?? null),
  create: (payload) => api.post('/jockey-profiles', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/jockey-profiles/${id}`, payload).then((r) => r.data),
};

export const jockeyProfileService = USE_MOCK ? mockService : realService;
