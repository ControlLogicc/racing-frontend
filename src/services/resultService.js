import api from './api';
import { MOCK_RESULTS } from '../mocks/mockResults';
import { RACE_RESULT_STATUS } from '../constants/status';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _results = [...MOCK_RESULTS];
let _nextId = Math.max(0, ..._results.map((r) => r.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._results]),
  getByRace: (raceId) => Promise.resolve(_results.filter((r) => r.raceId === raceId)),
  getByHorse: (horseId) => Promise.resolve(_results.filter((r) => r.horseId === horseId)),
  getByJockey: (jockeyId) => Promise.resolve(_results.filter((r) => r.jockeyId === jockeyId)),
  getJockeyStats: (jockeyId) => {
    const rs = _results.filter((r) => r.jockeyId === jockeyId);
    return Promise.resolve({
      jockeyId,
      jockeyName: rs[0]?.jockeyName || 'Jockey',
      totalRaces: rs.length,
      totalWins: rs.filter(r => r.position === 1).length,
      top3Finishes: rs.filter(r => r.position <= 3).length,
      disqualifiedCount: rs.filter(r => String(r.position) === 'DQ').length,
      totalPrizeAmount: rs.reduce((acc, r) => acc + (r.prize || 0), 0),
      totalScoreAwarded: rs.reduce((acc, r) => acc + (r.scoreAwarded || 0), 0),
      averagePosition: rs.length ? (rs.reduce((acc, r) => acc + (Number(r.position) || 0), 0) / rs.length) : 0,
      winRate: rs.length ? (rs.filter(r => r.position === 1).length / rs.length) * 100 : 0
    });
  },

  // RACE_RESULT chỉ tạo được khi race COMPLETED — guard ở page
  // Referee tạo → resultStatus mặc định REVIEWED_BY_REFEREE
  create: (payload) => {
    const created = {
      id: _nextId++,
      resultStatus: RACE_RESULT_STATUS.REVIEWED_BY_REFEREE,
      createdAt: new Date().toISOString(),
      ...payload,
    };
    _results = [..._results, created];
    return Promise.resolve(created);
  },

  // Staff chỉnh sửa 1 dòng kết quả → tự động chuyển cả race sang FINAL_EDITED_BY_STAFF
  update: (id, payload) => {
    _results = _results.map((r) =>
      r.id === id
        ? { ...r, ...payload, resultStatus: RACE_RESULT_STATUS.FINAL_EDITED_BY_STAFF }
        : r
    );
    const found = _results.find((r) => r.id === id);
    return found ? Promise.resolve(found) : Promise.reject(new Error(`Result id=${id} not found`));
  },

  // Cập nhật resultStatus cho toàn bộ kết quả của 1 race
  setRaceStatus: (raceId, status) => {
    _results = _results.map((r) => (r.raceId === raceId ? { ...r, resultStatus: status } : r));
    return Promise.resolve({ success: true });
  },
};

// ─── Field mapper ─────────────────────────────────────────────────────────────
// Backend RaceResultResponse: { resultId, entryId, raceId, raceName, horseId, horseName,
//   jockeyId, jockeyName, position, finishTime, resultStatus, prizeAmount, scoreAwarded }
// Frontend JSX: { id, ... }
const mapResult = (r) => ({
  id: r.resultId ?? r.id,
  resultId: r.resultId,
  entryId: r.entryId,
  raceId: r.raceId,
  raceName: r.raceName,
  raceDate: r.raceDate ?? r.scheduledTime ?? r.raceTime ?? r.createdAt,
  seasonId: r.seasonId,
  seasonName: r.seasonName,
  horseId: r.horseId,
  horseName: r.horseName,
  jockeyId: r.jockeyId,
  jockeyName: r.jockeyName,
  position: r.position,
  finishTime: r.finishTime,
  resultStatus: r.resultStatus,
  prizeAmount: r.prizeAmount,
  prize: r.prizeAmount ?? r.prize, // maps to prize for frontend backward compatibility
  scoreAwarded: r.scoreAwarded,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});
const mapResults = (list) => (Array.isArray(list) ? list.map(mapResult) : []);

const realService = {
  // Backend không có GET /results — load qua races rồi lấy từng race
  getAll: async () => {
    try {
      const races = await api.get('/races', { skipAuthRedirect: true })
        .then((r) => Array.isArray(r.data) ? r.data : []);
      const withResults = races.filter((r) =>
        ['RESULT_PENDING', 'OFFICIAL', 'COMPLETED', 'RUNNING'].includes(r.status)
      );
      if (!withResults.length) return [];
      const sets = await Promise.all(
        withResults.map((r) =>
          api.get(`/results/${r.raceId}`, { skipAuthRedirect: true })
            .then((res) => mapResults(res.data))
            .catch(() => [])
        )
      );
      return sets.flat();
    } catch {
      return [];
    }
  },

  // GET /results/{raceId} (NOT /races/{raceId}/results)
  getByRace: (raceId) =>
    api.get(`/results/${raceId}`, { skipAuthRedirect: true }).then((r) => mapResults(r.data)),
  getByHorse: async (horseId) => {
    try {
      return await api.get(`/results/horse/${horseId}`, { skipAuthRedirect: true })
        .then((r) => mapResults(r.data));
    } catch {
      const allResults = await realService.getAll();
      return allResults.filter((r) => String(r.horseId) === String(horseId));
    }
  },
  getByJockey: (jockeyId) =>
    api.get(`/results/jockey/${jockeyId}`, { skipAuthRedirect: true }).then((r) => mapResults(r.data)),
  getJockeyStats: (jockeyId) =>
    api.get(`/results/jockey/${jockeyId}/stats`, { skipAuthRedirect: true }).then((r) => r.data),

  // POST /results { entryId, position, finishTime, resultStatus }
  create: (payload) => api.post('/results', payload).then((r) => mapResult(r.data)),
  createForRace: async (raceId, payload) => {
    const results = Array.isArray(payload?.results) ? payload.results : [payload];
    // Thực hiện gọi tuần tự hoặc song song nhiều api.post vì backend chỉ hỗ trợ single
    const createdResults = await Promise.all(
      results.map((res) => api.post('/results', { raceId, ...res }).then((r) => mapResult(r.data)))
    );
    return createdResults;
  },

  // POST /races/{raceId}/results { results: [{ entryId, position, finishTime, resultStatus }] }
  // Lưu nhiều kết quả 1 lần, backend validate + lưu atomically (rollback toàn bộ nếu 1 dòng lỗi).
  createBatchForRace: (raceId, results) =>
    api.post(`/races/${raceId}/results`, { results }).then((r) => mapResults(r.data)),

  // Backend chưa có PUT /results/{id} — không thể chỉnh sửa kết quả riêng lẻ
  update: (id, { position, finishTime }) =>
    api.put(`/results/${id}`, { position, finishTime }).then((r) => mapResult(r.data)),

  remove: (id) => api.delete(`/results/${id}`).then((r) => r.data),

  recalculate: (raceId) =>
    api.post(`/admin/races/${raceId}/recalculate-prizes`).then((r) => r.data),

  setRaceStatus: (raceId, status) =>
    api.patch(`/race-management/races/${raceId}/status`, { status }).then((r) => r.data),
};

export const resultService = USE_MOCK ? mockService : realService;
