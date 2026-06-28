import api from './api';
import { MOCK_REFEREE_REPORTS } from '../mocks/mockRefereeReports';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _reports = [...MOCK_REFEREE_REPORTS];
let _nextId = Math.max(0, ..._reports.map((r) => r.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._reports]),
  getByRace: (raceId) => Promise.resolve(_reports.filter((r) => r.raceId === raceId)),
  create: (payload) => {
    const created = { id: _nextId++, createdAt: new Date().toISOString(), ...payload };
    _reports = [..._reports, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    _reports = _reports.map((r) => (r.id === id ? { ...r, ...payload } : r));
    return Promise.resolve(_reports.find((r) => r.id === id));
  },
};

// RefereeReportResponse: { reportId, raceId, raceName, refereeId, refereeName,
//   reportType, content, violations, decisions, createdAt, updatedAt }
const mapReport = (r) => ({
  id: r.reportId,
  reportId: r.reportId,
  raceId: r.raceId,
  raceName: r.raceName,
  refereeId: r.refereeId,
  refereeName: r.refereeName,
  reportType: r.reportType,
  content: r.content,
  violations: r.violations,
  decisions: r.decisions,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});
const mapReports = (list) => (Array.isArray(list) ? list.map(mapReport) : []);

const realService = {
  // GET /reports — ADMIN only
  getAll: () => api.get('/reports').then((r) => mapReports(r.data)).catch(() => []),

  // GET /reports/{raceId} — ADMIN, REFEREE, STAFF
  getByRace: (raceId) => api.get(`/reports/${raceId}`).then((r) => mapReports(r.data)).catch(() => []),

  // POST /reports — REFEREE
  create: ({ raceId, reportType, content, violations, decisions }) =>
    api.post('/reports', {
      raceId,
      reportType,
      content,
      violations: violations || null,
      decisions: decisions || null,
    }).then((r) => mapReport(r.data)),

  // PUT /reports/{id} — ADMIN or REFEREE
  update: (id, { reportType, content, violations, decisions }) =>
    api.put(`/reports/${id}`, { reportType, content, violations, decisions })
      .then((r) => mapReport(r.data)),

  remove: (id) => api.delete(`/reports/${id}`).then((r) => r.data),
};

export const refereeReportService = USE_MOCK ? mockService : realService;
