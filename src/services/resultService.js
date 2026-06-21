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

const realService = {
  getAll: () => api.get('/race-results').then((r) => r.data),
  getByRace: (raceId) => api.get(`/race-results/race/${raceId}`).then((r) => r.data),
  getByHorse: (horseId) => api.get(`/race-results/horse/${horseId}`).then((r) => r.data),
  create: (payload) => api.post('/race-results', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/race-results/${id}`, payload).then((r) => r.data),
  setRaceStatus: (raceId, status) =>
    api.patch(`/race-results/race/${raceId}/status`, { status }).then((r) => r.data),
};

export const resultService = USE_MOCK ? mockService : realService;
