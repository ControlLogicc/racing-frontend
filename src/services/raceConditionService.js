import api from './api';
import { MOCK_RACE_CONDITIONS } from '../mocks/mockRaceConditions';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _conditions = [...MOCK_RACE_CONDITIONS];
let _nextId = Math.max(..._conditions.map((c) => c.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._conditions]),
  getByRace: (raceId) => Promise.resolve(_conditions.filter((c) => c.raceId === raceId)),
  create: (payload) => {
    const created = { id: _nextId++, ...payload };
    _conditions = [..._conditions, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    _conditions = _conditions.map((c) => (c.id === id ? { ...c, ...payload } : c));
    return Promise.resolve(_conditions.find((c) => c.id === id));
  },
  remove: (id) => {
    _conditions = _conditions.filter((c) => c.id !== id);
    return Promise.resolve({ success: true });
  },
};

// RaceConditionResponse: { conditionId, conditionName, distance, trackType, minEntries, maxEntries, classRequirement }
// Frontend JSX: { id, conditionName, ... }
const mapCond = (c) => ({
  id: c.conditionId,
  conditionId: c.conditionId,
  conditionName: c.conditionName,
  distance: c.distance,
  trackType: c.trackType,
  minEntries: c.minEntries,
  maxEntries: c.maxEntries,
  classRequirement: c.classRequirement,
  createdAt: c.createdAt,
});
const mapConds = (list) => (Array.isArray(list) ? list.map(mapCond) : []);

const realService = {
  getAll: () => api.get('/admin/race-conditions').then((r) => mapConds(r.data)),
  getByRace: (raceId) => api.get('/admin/race-conditions', { params: { raceId } }).then((r) => mapConds(r.data)),
  create: (payload) => api.post('/admin/race-conditions', payload).then((r) => mapCond(r.data)),
  update: (id, payload) => api.put(`/admin/race-conditions/${id}`, payload).then((r) => mapCond(r.data)),
  remove: (id) => api.delete(`/admin/race-conditions/${id}`).then((r) => r.data),
};

export const raceConditionService = USE_MOCK ? mockService : realService;
