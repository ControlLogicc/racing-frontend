import api from './api';
import { MOCK_PRIZES } from '../mocks/mockPrizes';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _prizes = [...MOCK_PRIZES];
let _nextId = Math.max(..._prizes.map((p) => p.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._prizes]),
  getPublicAll: () => Promise.resolve([..._prizes]),
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

// PrizeStructureResponse: { prizeId, raceId, raceName, position, amount, score, createdAt }
// Frontend JSX: { id, raceId, position, amount, score }
const mapPrize = (p) => ({
  id: p.prizeId,
  prizeId: p.prizeId,
  raceId: p.raceId,
  raceName: p.raceName,
  position: p.position,
  amount: p.amount,
  score: p.score,
  createdAt: p.createdAt,
});
const mapPrizes = (list) => (Array.isArray(list) ? list.map(mapPrize) : []);

const realService = {
  getAll: () => api.get('/admin/prize-structures').then((r) => mapPrizes(r.data)),
  // Jockey/Owner: thử /prize-structures trước (public), fallback /admin/prize-structures
  getPublicAll: () => api.get('/admin/prize-structures').then((r) => mapPrizes(r.data)).catch(() => []),
  getByRace: (raceId) => api.get('/admin/prize-structures', { params: { raceId } }).then((r) => mapPrizes(r.data)),
  create: (payload) => api.post('/admin/prize-structures', payload).then((r) => mapPrize(r.data)),
  update: (id, payload) => api.put(`/admin/prize-structures/${id}`, payload).then((r) => mapPrize(r.data)),
  remove: (id) => api.delete(`/admin/prize-structures/${id}`).then((r) => r.data),
};

export const prizeService = USE_MOCK ? mockService : realService;
