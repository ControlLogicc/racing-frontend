import { MOCK_REFEREE_REPORTS } from '../mocks/mockRefereeReports';
import api from './api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _reports = [...MOCK_REFEREE_REPORTS];
let _nextId = Math.max(0, ..._reports.map((r) => r.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._reports]),
  getByRace: (raceId) => Promise.resolve(_reports.filter((r) => r.raceId === raceId)),
  getByReferee: (refereeId) => Promise.resolve(_reports.filter((r) => r.refereeId === refereeId)),
  create: (payload) => {
    const created = { id: _nextId++, createdAt: new Date().toISOString(), ...payload };
    _reports = [..._reports, created];
    return Promise.resolve(created);
  },
};

const realService = {
  getAll: () => api.get('/referee-reports').then((r) => r.data),
  getByRace: (raceId) => api.get('/referee-reports', { params: { raceId } }).then((r) => r.data),
  getByReferee: (refereeId) => api.get('/referee-reports', { params: { refereeId } }).then((r) => r.data),
  create: (payload) => api.post('/referee-reports', payload).then((r) => r.data),
};

export const refereeReportService = USE_MOCK ? mockService : realService;
