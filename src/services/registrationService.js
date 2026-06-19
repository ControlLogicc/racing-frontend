import api from './api';
import { MOCK_REGISTRATIONS } from '../mocks/mockRegistrations';
import { RACE_REGISTRATION_STATUS } from '../constants/status';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let mockStore = [...MOCK_REGISTRATIONS];
let nextId = mockStore.length + 1;

const mockService = {
  getAll: () => Promise.resolve([...mockStore]),
  getByOwner: (ownerId) => Promise.resolve(mockStore.filter((r) => r.ownerId === ownerId)),
  create: (payload) => {
    const created = {
      id: nextId++,
      status: RACE_REGISTRATION_STATUS.SUBMITTED,
      submittedAt: new Date().toISOString(),
      ...payload,
    };
    mockStore = [...mockStore, created];
    return Promise.resolve(created);
  },
  cancel: (id) => {
    mockStore = mockStore.map((r) =>
      r.id === id ? { ...r, status: RACE_REGISTRATION_STATUS.CANCELLED } : r
    );
    return Promise.resolve(mockStore.find((r) => r.id === id));
  },
};

// ─── Real API (VITE_USE_MOCK=false) ───────────────────────────────────────────
const realService = {
  getAll: (params) => api.get('/race-registrations', { params }).then((r) => r.data),
  getByOwner: (ownerId) =>
    api.get('/race-registrations', { params: { ownerId } }).then((r) => r.data),
  create: (payload) => api.post('/race-registrations', payload).then((r) => r.data),
  cancel: (id) => api.patch(`/race-registrations/${id}/cancel`).then((r) => r.data),
};

export const registrationService = USE_MOCK ? mockService : realService;
