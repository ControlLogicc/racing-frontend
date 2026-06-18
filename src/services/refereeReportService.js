import { MOCK_REFEREE_REPORTS } from '../mocks/mockRefereeReports';
import api from './api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let reports = [...MOCK_REFEREE_REPORTS];
let nextId = reports.length + 1;

export const refereeReportService = {
  getAll: () => {
    if (USE_MOCK) return Promise.resolve(reports);
    return api.get('/referee-reports').then((r) => r.data);
  },
  getByReferee: (refereeId) => {
    if (USE_MOCK) return Promise.resolve(reports.filter((r) => r.refereeId === refereeId));
    return api.get('/referee-reports', { params: { refereeId } }).then((r) => r.data);
  },
  create: (payload) => {
    if (USE_MOCK) {
      const created = { id: nextId++, createdAt: new Date().toISOString(), ...payload };
      reports = [...reports, created];
      return Promise.resolve(created);
    }
    return api.post('/referee-reports', payload).then((r) => r.data);
  },
};
