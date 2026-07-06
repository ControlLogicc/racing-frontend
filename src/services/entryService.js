import api from './api';
import { MOCK_ENTRIES } from '../mocks/mockEntries';
import { RACE_ENTRY_STATUS } from '../constants/status';
import { raceService } from './raceService';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const normalizeEntryStatus = (status) => {
  if (!status) return status;
  const normalized = String(status).trim().toUpperCase();
  if (normalized === 'SCRATCHED' || normalized === 'REMOVED' || normalized === 'DNF') {
    return RACE_ENTRY_STATUS.WITHDRAWN;
  }
  if (normalized === 'READY' || normalized === 'READY_TO_RACE' || normalized === 'VALID_RESULT') {
    return RACE_ENTRY_STATUS.PASSED;
  }
  if (normalized === 'PENALIZED' || normalized === 'DISQUALIFIED') {
    return RACE_ENTRY_STATUS.FAILED;
  }
  if (normalized === 'CHECKED_IN' || normalized === 'PRE_RACE_CHECK') {
    return RACE_ENTRY_STATUS.DECLARED;
  }
  return normalized;
};

const normalizeWeightCheckStatus = (status) => {
  if (!status) return status;
  return String(status).toUpperCase();
};

const calculateLeadWeight = (handicapWeight, actualWeight) => {
  if (handicapWeight === null || handicapWeight === undefined || actualWeight === null || actualWeight === undefined) {
    return null;
  }
  return Math.max(Number(handicapWeight) - Number(actualWeight), 0);
};

const calculateCarriedWeight = (handicapWeight, actualWeight) => {
  if (actualWeight === null || actualWeight === undefined) return null;
  const leadWeight = calculateLeadWeight(handicapWeight, actualWeight) ?? 0;
  return Number(actualWeight) + leadWeight;
};

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
        ? { ...e, status: RACE_ENTRY_STATUS.DECLARED, confirmedAt: new Date().toISOString() }
        : e
    );
    return Promise.resolve(mockStore.find((e) => e.id === id));
  },
  // Staff remove entry khỏi race
  remove: (id) => {
    mockStore = mockStore.map((e) =>
      e.id === id ? { ...e, status: RACE_ENTRY_STATUS.SCRATCHED } : e
    );
    return Promise.resolve({ success: true });
  },
  updateWeight: (id, payload) => {
    mockStore = mockStore.map((e) => {
      if (e.id !== id) return e;
      const handicapWeight = payload.handicapWeight ?? e.handicapWeight;
      const actualWeight = payload.actualWeight;
      // Dùng leadWeight từ payload nếu có, không tự tính lại
      const leadWeight = payload.leadWeight != null ? payload.leadWeight : calculateLeadWeight(handicapWeight, actualWeight);
      const carriedWeight = payload.carriedWeight != null ? payload.carriedWeight : (Number(actualWeight) + Number(leadWeight ?? 0));

      return {
        ...e,
        handicapWeight,
        actualWeight,
        jockeyActualWeight: actualWeight,
        leadWeight,
        carriedWeight,
        weightCheckStatus: payload.weightCheckStatus,
        preCheckNote: payload.note ?? e.preCheckNote,
        status: payload.weightCheckStatus === 'FAILED' ? RACE_ENTRY_STATUS.FAILED : RACE_ENTRY_STATUS.PASSED,
        updatedAt: new Date().toISOString(),
      };
    });
    return Promise.resolve(mockStore.find((e) => e.id === id));
  },
  checkIn: (id) => {
    mockStore = mockStore.map((e) =>
      e.id === id
        ? { ...e, status: RACE_ENTRY_STATUS.PRE_RACE_CHECK, updatedAt: new Date().toISOString() }
        : e
    );
    return Promise.resolve(mockStore.find((e) => e.id === id));
  },
  markReady: (id) => {
    mockStore = mockStore.map((e) =>
      e.id === id
        ? { ...e, status: RACE_ENTRY_STATUS.READY_TO_RACE, updatedAt: new Date().toISOString() }
        : e
    );
    return Promise.resolve(mockStore.find((e) => e.id === id));
  },
  preCheck: (id, payload) => mockService.updateWeight(id, payload),
  create: (payload) => {
    const newEntry = {
      id: mockStore.length + 1,
      entryId: mockStore.length + 1,
      registrationId: payload.registrationId,
      jockeyId: payload.jockeyId,
      handicapWeight: payload.handicapWeight,
      gateNumber: payload.gateNumber,
      status: RACE_ENTRY_STATUS.DECLARED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockStore.push(newEntry);
    return Promise.resolve(newEntry);
  },
  randomizeGates: (raceId) => {
    const entries = mockStore.filter((e) => e.raceId === raceId);
    const shuffled = [...Array(entries.length).keys()].map((i) => i + 1);
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    mockStore = mockStore.map((e) => {
      if (e.raceId === raceId) {
        const idx = entries.findIndex((entry) => entry.id === e.id);
        return { ...e, gateNumber: shuffled[idx] };
      }
      return e;
    });
    return Promise.resolve(mockStore.filter((e) => e.raceId === raceId));
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
  currentScore: e.currentScore,
  horseClass: e.horseClass,
  ratingVerified: e.ratingVerified,
  actualWeight: e.actualWeight ?? e.jockeyActualWeight,
  jockeyActualWeight: e.jockeyActualWeight ?? e.actualWeight,
  leadWeight: e.leadWeight,
  carriedWeight: e.carriedWeight,
  // BE mới (PreRaceWeightCheck): overweightAmount = carriedWeight - handicapWeight (đã clamp >= 0), dung sai 0.91kg.
  overweightAmount: e.overweightAmount,
  weightCheckStatus: normalizeWeightCheckStatus(e.weightCheckStatus),
  preCheckNote: e.preCheckNote,
  status: normalizeEntryStatus(e.entryStatus),              // entryStatus → status
  confirmedByStaffId: e.confirmedByStaffId,
  confirmedByStaffName: e.confirmedByStaffName,
  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
  scheduledTime: e.scheduledTime,
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

  // Backend không có /entries/jockey — lấy từ invitations ACCEPTED/USED của jockey và fetch chi tiết từ backend nếu có entryId
  getByJockey: async () => {
    try {
      const invs = await api.get('/invitations').then((r) => Array.isArray(r.data) ? r.data : []);
      const acceptedInvs = invs.filter((inv) => inv.status === 'ACCEPTED' || inv.status === 'USED');
      
      const entryPromises = acceptedInvs.map(async (inv) => {
        if (inv.entryId) {
          try {
            const res = await api.get(`/entries/${inv.entryId}`);
            return mapEntry(res.data);
          } catch {
            // fallback
          }
        }
        return mapEntry({
          entryId: inv.entryId || inv.invitationId,
          raceId: inv.raceId,
          raceName: inv.raceName,
          registrationId: inv.raceRegistrationId,
          invitationId: inv.invitationId,
          horseId: inv.horseId,
          horseName: inv.horseName,
          jockeyId: inv.jockeyId,
          jockeyName: inv.jockeyName,
          entryStatus: 'declared',
          createdAt: inv.respondedAt || inv.sentAt,
          scheduledTime: inv.scheduledTime,
        });
      });
      return await Promise.all(entryPromises);
    } catch {
      return [];
    }
  },

  // Referee: lấy entries từ races được phân công cho referee
  getForReferee: async (refereeInput) => {
    try {
      const races = await raceService.getAssignedToReferee(refereeInput);
      if (!races.length) return [];
      const sets = await Promise.all(
        races.map((r) =>
          api.get(`/entries/race/${r.id}`).then((res) => mapEntries(res.data)).catch(() => [])
        )
      );
      return sets.flat();
    } catch {
      return [];
    }
  },

  // GET /entries/race/{raceId}/candidates — cặp Ngựa+Jockey đã accepted invitation, sẵn sàng tạo Entry
  getCandidates: (raceId) =>
    api.get(`/entries/race/${raceId}/candidates`).then((r) => Array.isArray(r.data) ? r.data : []),

  create: (payload) => api.post('/entries', payload).then((r) => mapEntry(r.data)),
  updateWeight: (id, payload) => api.put(`/entries/${id}/weight`, payload).then((r) => mapEntry(r.data)),
  // BE (RaceEntryService.applyWeightValues) giờ chỉ dùng actualWeight + note — handicapWeight lấy từ entry đã lưu
  // (không cho sửa qua endpoint này), leadWeight luôn ép về 0, carriedWeight/weightCheckStatus BE tự tính lại
  // (PreRaceWeightCheck, dung sai 0.91kg) — gửi thừa các field cũ không còn tác dụng.
  preCheck: (id, data) =>
    api.put(`/entries/${id}/pre-check`, {
      actualWeight: data.actualWeight,
      note: data.note || null,
    }).then((r) => mapEntry(r.data)),
  submitPreCheck: (id, data) =>
    api.put(`/entries/${id}/weight`, {
      actualWeight: data.actualWeight,
      healthStatus: data.healthStatus,
      note: data.note || null,
    }).then((r) => mapEntry(r.data)),
  checkIn: (id) => api.put(`/entries/${id}/status`, { status: 'pre_race_check' }).then((r) => mapEntry(r.data)),
  markReady: (id) => api.put(`/entries/${id}/status`, { status: 'ready_to_race' }).then((r) => mapEntry(r.data)),
  confirm: (id) => api.put(`/entries/${id}/status`, { status: 'declared' }).then((r) => mapEntry(r.data)),
  remove: (id) => api.put(`/entries/${id}/status`, { status: 'scratched' }).then((r) => mapEntry(r.data)),
  randomizeGates: (raceId) => api.put(`/entries/race/${raceId}/random-gates`).then((r) => mapEntries(r.data)),
};

export const entryService = USE_MOCK ? mockService : realService;
