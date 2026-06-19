import api from './api';
import { MOCK_RACES } from '../mocks/mockRaces';
import { RACE_STATUS } from '../constants/status';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _races = [...MOCK_RACES];
let _nextId = Math.max(..._races.map((r) => r.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._races]),
  getAssignedToReferee: (refereeId) =>
    Promise.resolve(_races.filter((r) => r.assignedRefereeIds?.includes(refereeId))),
  create: (payload) => {
    const created = { id: _nextId++, status: RACE_STATUS.UPCOMING, assignedRefereeIds: [], ...payload };
    _races = [..._races, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    _races = _races.map((r) => (r.id === id ? { ...r, ...payload } : r));
    return Promise.resolve(_races.find((r) => r.id === id));
  },
  remove: (id) => {
    _races = _races.filter((r) => r.id !== id);
    return Promise.resolve({ success: true });
  },
  setStatus: (id, status) => {
    _races = _races.map((r) => (r.id === id ? { ...r, status } : r));
    return Promise.resolve(_races.find((r) => r.id === id));
  },
};

const realService = {
  getAll: () => api.get('/races').then((r) => r.data),
  getAssignedToReferee: (refereeId) =>
    api.get('/races', { params: { refereeId } }).then((r) => r.data),
  create: (payload) => api.post('/races', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/races/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/races/${id}`).then((r) => r.data),
  setStatus: (id, status) => api.patch(`/races/${id}/status`, { status }).then((r) => r.data),
};

export const raceService = USE_MOCK ? mockService : realService;
