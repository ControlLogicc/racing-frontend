import api from './api';
import { MOCK_MEETINGS } from '../mocks/mockMeetings';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _meetings = [...MOCK_MEETINGS];
let _nextId = Math.max(..._meetings.map((m) => m.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._meetings]),
  getPublic: () => Promise.resolve([..._meetings]),
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

// RaceMeetingResponse: { meetingId, meetingName, seasonId, seasonName, racecourseId, racecourseName, meetingDate, createdAt }
// Frontend JSX: { id, name, seasonId, date }
const mapMeeting = (m) => ({
  id: m.meetingId,
  meetingId: m.meetingId,
  name: m.meetingName,
  seasonId: m.seasonId,
  seasonName: m.seasonName,
  racecourseId: m.racecourseId,
  racecourseName: m.racecourseName,
  date: m.meetingDate,
  meetingDate: m.meetingDate,
  createdAt: m.createdAt,
});
const mapMeetings = (list) => (Array.isArray(list) ? list.map(mapMeeting) : []);

// RaceMeetingRequest: { meetingName, seasonId, racecourseId, meetingDate }
// racecourse (text) → gửi thêm racecourseId nếu có, nếu không có thì gửi 1 (default seed)
const toMeetingPayload = ({ name, meetingName, seasonId, racecourseId, racecourse, date, meetingDate }) => ({
  meetingName: meetingName || name,
  seasonId: seasonId ? Number(seasonId) : undefined,
  racecourseId: racecourseId ? Number(racecourseId) : 1,
  meetingDate: (meetingDate || date || '').slice(0, 10),
});

const realService = {
  getAll: () => api.get('/admin/race-meetings').then((r) => mapMeetings(r.data)),
  getPublic: () => api.get('/admin/race-meetings').then((r) => mapMeetings(r.data)).catch(() => []),
  getById: (id) => api.get(`/admin/race-meetings/${id}`).then((r) => mapMeeting(r.data)),
  create: (payload) => api.post('/admin/race-meetings', toMeetingPayload(payload)).then((r) => mapMeeting(r.data)),
  update: (id, payload) => api.put(`/admin/race-meetings/${id}`, toMeetingPayload(payload)).then((r) => mapMeeting(r.data)),
  remove: (id) => api.delete(`/admin/race-meetings/${id}`).then((r) => r.data),
};

export const meetingService = USE_MOCK ? mockService : realService;
