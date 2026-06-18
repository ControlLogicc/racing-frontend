import { MOCK_MEETINGS } from '../mocks/mockMeetings';

let meetings = [...MOCK_MEETINGS];
let nextId = meetings.length + 1;

export const meetingService = {
  getAll: () => Promise.resolve(meetings), // 🟡 mock — khi có API: api.get('/meetings').then(r => r.data)
  create: (payload) => {
    const created = { id: nextId++, ...payload };
    meetings = [...meetings, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    meetings = meetings.map((m) => (m.id === id ? { ...m, ...payload } : m));
    return Promise.resolve(meetings.find((m) => m.id === id));
  },
  remove: (id) => {
    meetings = meetings.filter((m) => m.id !== id);
    return Promise.resolve({ success: true });
  },
};
