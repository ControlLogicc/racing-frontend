import api from './api';
import { MOCK_INVITATIONS } from '../mocks/mockInvitations';
import { RACE_INVITATION_STATUS } from '../constants/status';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let mockStore = [...MOCK_INVITATIONS];
let nextId = mockStore.length + 1;

const mockService = {
  getAll: () => Promise.resolve([...mockStore]),
  getByRegistration: (registrationId) =>
    Promise.resolve(mockStore.filter((i) => i.registrationId === registrationId)),
  getByJockey: (jockeyId) =>
    Promise.resolve(mockStore.filter((i) => i.jockeyId === jockeyId)),
  send: (payload) => {
    const created = {
      id: nextId++,
      status: RACE_INVITATION_STATUS.SENT,
      sentAt: new Date().toISOString(),
      ...payload,
    };
    mockStore = [...mockStore, created];
    return Promise.resolve(created);
  },
  cancel: (id) => {
    mockStore = mockStore.filter((i) => i.id !== id);
    return Promise.resolve({ success: true });
  },
  accept: (id) => {
    mockStore = mockStore.map((i) =>
      i.id === id ? { ...i, status: RACE_INVITATION_STATUS.ACCEPTED } : i
    );
    return Promise.resolve(mockStore.find((i) => i.id === id));
  },
  decline: (id) => {
    mockStore = mockStore.map((i) =>
      i.id === id ? { ...i, status: RACE_INVITATION_STATUS.DECLINED } : i
    );
    return Promise.resolve(mockStore.find((i) => i.id === id));
  },
  setDeadline: (id, deadline) => {
    mockStore = mockStore.map((i) => (i.id === id ? { ...i, deadline } : i));
    return Promise.resolve(mockStore.find((i) => i.id === id));
  },
  removeExpired: (id) => {
    mockStore = mockStore.map((i) =>
      i.id === id ? { ...i, status: RACE_INVITATION_STATUS.REMOVED } : i
    );
    return Promise.resolve({ success: true });
  },
};

const realService = {
  getAll: () => api.get('/race-invitations').then((r) => r.data),
  getByRegistration: (registrationId) =>
    api.get('/race-invitations', { params: { registrationId } }).then((r) => r.data),
  getByJockey: (jockeyId) =>
    api.get('/race-invitations', { params: { jockeyId } }).then((r) => r.data),
  send: (payload) => api.post('/race-invitations', payload).then((r) => r.data),
  cancel: (id) => api.delete(`/race-invitations/${id}`).then((r) => r.data),
  accept: (id) => api.patch(`/race-invitations/${id}/accept`).then((r) => r.data),
  decline: (id) => api.patch(`/race-invitations/${id}/decline`).then((r) => r.data),
  setDeadline: (id, deadline) =>
    api.patch(`/race-invitations/${id}/deadline`, { deadline }).then((r) => r.data),
  removeExpired: (id) => api.patch(`/race-invitations/${id}/remove`).then((r) => r.data),
};

export const invitationService = USE_MOCK ? mockService : realService;
