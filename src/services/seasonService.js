import api from './api';
import { MOCK_SEASONS } from '../mocks/mockSeasons';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _seasons = [...MOCK_SEASONS];
let _nextId = Math.max(..._seasons.map((s) => s.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._seasons]),
  getById: (id) => Promise.resolve(_seasons.find((s) => Number(s.id) === Number(id)) ?? null),
  create: (payload) => {
    const created = { id: _nextId++, ...payload };
    _seasons = [..._seasons, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    _seasons = _seasons.map((s) => (Number(s.id) === Number(id) ? { ...s, ...payload } : s));
    return Promise.resolve(_seasons.find((s) => Number(s.id) === Number(id)));
  },
  remove: (id) => {
    _seasons = _seasons.filter((s) => Number(s.id) !== Number(id));
    return Promise.resolve({ success: true });
  },
};

// SeasonResponse: { seasonId, seasonName, startDate, endDate, status, createdAt }
// Frontend JSX: { id, name, startDate, endDate }
const mapSeason = (s) => ({
  id: s.seasonId,
  seasonId: s.seasonId,
  name: s.seasonName,
  startDate: s.startDate,
  endDate: s.endDate,
  status: s.status,
  createdAt: s.createdAt,
});
const mapSeasons = (list) => (Array.isArray(list) ? list.map(mapSeason) : []);

// SeasonRequest: { seasonName, startDate, endDate, status }
// JSX form sends: { name, startDate, endDate }
// Backend validates lowercase: 'draft' | 'active' | 'completed' | 'cancelled'
const toSeasonPayload = ({ name, seasonName, startDate, endDate, status }) => ({
  seasonName: seasonName || name,
  startDate,
  endDate,
  status: (status || 'active').toLowerCase(),
});

const realService = {
  getAll: () => api.get('/admin/seasons').then((r) => mapSeasons(r.data)),
  getById: (id) => api.get(`/admin/seasons/${id}`).then((r) => mapSeason(r.data)),
  create: (payload) => api.post('/admin/seasons', toSeasonPayload(payload)).then((r) => mapSeason(r.data)),
  update: (id, payload) => api.put(`/admin/seasons/${id}`, toSeasonPayload(payload)).then((r) => mapSeason(r.data)),
  remove: (id) => api.delete(`/admin/seasons/${id}`).then((r) => r.data),
};

export const seasonService = USE_MOCK ? mockService : realService;
