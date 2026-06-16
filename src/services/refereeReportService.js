import { MOCK_REFEREE_REPORTS } from '../mocks/mockRefereeReports';

let reports = [...MOCK_REFEREE_REPORTS];
let nextId = reports.length + 1;

export const refereeReportService = {
  getAll: () => Promise.resolve(reports), // 🟡 mock — khi có API: api.get('/referee-reports').then(r => r.data)
  create: (payload) => {
    const created = { id: nextId++, createdAt: new Date().toISOString(), ...payload };
    reports = [...reports, created];
    return Promise.resolve(created);
  },
};
