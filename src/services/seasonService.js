import api from './api';
import { MOCK_SEASONS } from '../mocks/mockSeasons';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _seasons = [...MOCK_SEASONS];
let _nextId = Math.max(..._seasons.map((s) => s.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._seasons]),
  create: (payload) => {
    const created = { id: _nextId++, ...payload };
    _seasons = [..._seasons, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    _seasons = _seasons.map((s) => (s.id === id ? { ...s, ...payload } : s));
    return Promise.resolve(_seasons.find((s) => s.id === id));
  },
  remove: (id) => {
    _seasons = _seasons.filter((s) => s.id !== id);
    return Promise.resolve({ success: true });
  },
};

const realService = {
  getAll: () => api.get('/seasons').then((r) => r.data),
  create: (payload) => api.post('/seasons', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/seasons/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/seasons/${id}`).then((r) => r.data),
};

export const seasonService = USE_MOCK ? mockService : realService;
