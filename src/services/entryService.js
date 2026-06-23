import api from './api';
import { MOCK_ENTRIES } from '../mocks/mockEntries';
import { RACE_ENTRY_STATUS } from '../constants/status';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ─── Mock (VITE_USE_MOCK=true) ────────────────────────────────────────────────
let mockStore = [...MOCK_ENTRIES];

const mockService = {
  getAll: () => Promise.resolve([...mockStore]),
  getByJockey: (jockeyId) => Promise.resolve(mockStore.filter((e) => e.jockeyId === jockeyId)),
  getForReferee: () => Promise.resolve([...mockStore]),
  // Staff confirm entry (D11): đổi status → CONFIRMED, KHÔNG tạo mới
  confirm: (id) => {
    mockStore = mockStore.map((e) =>
      e.id === id
        ? { ...e, status: RACE_ENTRY_STATUS.CONFIRMED, confirmedAt: new Date().toISOString() }
        : e
    );
    return Promise.resolve(mockStore.find((e) => e.id === id));
  },
  // Staff remove entry khỏi race
  remove: (id) => {
    mockStore = mockStore.map((e) =>
      e.id === id ? { ...e, status: RACE_ENTRY_STATUS.REMOVED } : e
    );
    return Promise.resolve({ success: true });
  },
};

// ─── Field mapper ─────────────────────────────────────────────────────────────
// Backend RaceEntryResponse: { entryId, raceId, raceName, registrationId, invitationId,
//   horseId, horseName, jockeyId, jockeyName, gateNumber, drawNumber, handicapWeight,
//   actualWeight, weightCheckStatus, entryStatus, confirmedByStaffId, confirmedByStaffName }
// Frontend JSX dùng: { id, status, ... }
const mapEntry = (e) => ({
  id: e.entryId,
  entryId: e.entryId,
  raceId: e.raceId,
  raceName: e.raceName,
  registrationId: e.registrationId,
  invitationId: e.invitationId,
  horseId: e.horseId,
  horseName: e.horseName,
  jockeyId: e.jockeyId,
  jockeyName: e.jockeyName,
  gateNumber: e.gateNumber,
  drawNumber: e.drawNumber,
  handicapWeight: e.handicapWeight,
  actualWeight: e.actualWeight,
  weightCheckStatus: e.weightCheckStatus,
  status: e.entryStatus,              // entryStatus → status
  confirmedByStaffId: e.confirmedByStaffId,
  confirmedByStaffName: e.confirmedByStaffName,
  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
});
const mapEntries = (list) => (Array.isArray(list) ? list.map(mapEntry) : []);

// ─── Real API (VITE_USE_MOCK=false) ───────────────────────────────────────────
// Backend URL: GET /entries/race/{raceId} (NOT /entries/{raceId})
// create payload: { registrationId, invitationId, gateNumber, handicapWeight }
// update status: PUT /entries/{id}/status { status: "declared"|"scratched"|... }
const realService = {
  // GET /entries/race/{raceId}
  getByRace: (raceId) => api.get(`/entries/race/${raceId}`).then((r) => mapEntries(r.data)),
  getById: (id) => api.get(`/entries/${id}`).then((r) => mapEntry(r.data)),

  // Backend không có GET /entries — load từng race của staff rồi fetch entries theo race
  // /staff/races chưa impl → fallback /admin/races
  getAll: async () => {
    try {
      let races = [];
      try {
        const res = await api.get('/staff/races');
        races = Array.isArray(res.data) ? res.data : [];
      } catch {
        const res = await api.get('/admin/races');
        races = Array.isArray(res.data) ? res.data : [];
      }
      if (!races.length) return [];
      const sets = await Promise.all(
        races.map((r) =>
          api.get(`/entries/race/${r.raceId}`).then((res) => mapEntries(res.data)).catch(() => [])
        )
      );
      return sets.flat();
    } catch {
      return [];
    }
  },

  // Backend không có /entries/jockey — lấy từ invitations ACCEPTED của jockey
  getByJockey: async () => {
    try {
      const invs = await api.get('/invitations').then((r) => Array.isArray(r.data) ? r.data : []);
      return invs
        .filter((inv) => inv.status === 'ACCEPTED')
        .map((inv) => mapEntry({
          entryId: inv.invitationId,
          raceId: inv.raceId,
          raceName: inv.raceName,
          horseId: inv.horseId,
          horseName: inv.horseName,
          jockeyId: inv.jockeyId,
          jockeyName: inv.jockeyName,
          entryStatus: 'CONFIRMED',
          createdAt: inv.respondedAt || inv.sentAt,
        }));
    } catch {
      return [];
    }
  },

  // Referee: lấy entries từ races được phân công cho referee
  getForReferee: async (refereeId) => {
    try {
      const races = await api.get('/admin/races', { params: { refereeId } })
        .then((r) => Array.isArray(r.data) ? r.data : []).catch(() => []);
      if (!races.length) return [];
      const sets = await Promise.all(
        races.map((r) =>
          api.get(`/entries/race/${r.raceId}`).then((res) => mapEntries(res.data)).catch(() => [])
        )
      );
      return sets.flat();
    } catch {
      return [];
    }
  },

  create: (payload) => api.post('/entries', payload).then((r) => mapEntry(r.data)),
  updateWeight: (id, payload) => api.put(`/entries/${id}/weight`, payload).then((r) => mapEntry(r.data)),
  confirm: (id) => api.put(`/entries/${id}/status`, { status: 'declared' }).then((r) => mapEntry(r.data)),
  remove: (id) => api.put(`/entries/${id}/status`, { status: 'scratched' }).then((r) => mapEntry(r.data)),
};

export const entryService = USE_MOCK ? mockService : realService;
