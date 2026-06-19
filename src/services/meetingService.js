import api from './api';
import { MOCK_MEETINGS } from '../mocks/mockMeetings';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _meetings = [...MOCK_MEETINGS];
let _nextId = Math.max(..._meetings.map((m) => m.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._meetings]),
  create: (payload) => {
    const created = { id: _nextId++, ...payload };
    _meetings = [..._meetings, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    _meetings = _meetings.map((m) => (m.id === id ? { ...m, ...payload } : m));
    return Promise.resolve(_meetings.find((m) => m.id === id));
  },
  remove: (id) => {
    _meetings = _meetings.filter((m) => m.id !== id);
    return Promise.resolve({ success: true });
  },
};

const realService = {
  getAll: () => api.get('/meetings').then((r) => r.data),
  create: (payload) => api.post('/meetings', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/meetings/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/meetings/${id}`).then((r) => r.data),
};

export const meetingService = USE_MOCK ? mockService : realService;
