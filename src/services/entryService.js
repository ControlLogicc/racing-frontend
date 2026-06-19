import api from './api';
import { MOCK_ENTRIES } from '../mocks/mockEntries';
import { RACE_ENTRY_STATUS } from '../constants/status';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ─── Mock (VITE_USE_MOCK=true) ────────────────────────────────────────────────
let mockStore = [...MOCK_ENTRIES];

const mockService = {
  getAll: () => Promise.resolve([...mockStore]),
  getByJockey: (jockeyId) => Promise.resolve(mockStore.filter((e) => e.jockeyId === jockeyId)),
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

// ─── Real API (VITE_USE_MOCK=false) ───────────────────────────────────────────
const realService = {
  getAll: (params) => api.get('/race-entries', { params }).then((r) => r.data),
  getByJockey: (jockeyId) =>
    api.get('/race-entries', { params: { jockeyId } }).then((r) => r.data),
  confirm: (id) => api.patch(`/race-entries/${id}/confirm`).then((r) => r.data),
  remove: (id) => api.patch(`/race-entries/${id}/remove`).then((r) => r.data),
};

export const entryService = USE_MOCK ? mockService : realService;
