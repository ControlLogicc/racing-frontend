import api from './api';
import { MOCK_PRIZES } from '../mocks/mockPrizes';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _prizes = [...MOCK_PRIZES];
let _nextId = Math.max(..._prizes.map((p) => p.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._prizes]),
  getByRace: (raceId) => Promise.resolve(_prizes.filter((p) => p.raceId === raceId)),
  create: (payload) => {
    const created = { id: _nextId++, ...payload };
    _prizes = [..._prizes, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    _prizes = _prizes.map((p) => (p.id === id ? { ...p, ...payload } : p));
    return Promise.resolve(_prizes.find((p) => p.id === id));
  },
  remove: (id) => {
    _prizes = _prizes.filter((p) => p.id !== id);
    return Promise.resolve({ success: true });
  },
};

const realService = {
  getAll: () => api.get('/prize-structures').then((r) => r.data),
  getByRace: (raceId) => api.get('/prize-structures', { params: { raceId } }).then((r) => r.data),
  create: (payload) => api.post('/prize-structures', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/prize-structures/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/prize-structures/${id}`).then((r) => r.data),
};

export const prizeService = USE_MOCK ? mockService : realService;
