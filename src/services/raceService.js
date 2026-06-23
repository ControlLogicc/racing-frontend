import api from './api';
import { MOCK_RACES } from '../mocks/mockRaces';
import { RACE_STATUS } from '../constants/status';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _races = [...MOCK_RACES];
let _nextId = Math.max(..._races.map((r) => r.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._races]),
  getPublic: () => Promise.resolve([..._races]),
  getOpen: () => Promise.resolve(_races.filter((r) => r.status === RACE_STATUS.UPCOMING)),
  getById: (id) => Promise.resolve(_races.find((r) => r.id === id) ?? null),
  getAssignedToReferee: (refereeId) =>
    Promise.resolve(_races.filter((r) => r.assignedRefereeIds?.includes(refereeId))),
  create: (payload) => {
    const created = { id: _nextId++, status: RACE_STATUS.UPCOMING, assignedRefereeIds: [], ...payload };
    _races = [..._races, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    _races = _races.map((r) => (r.id === id ? { ...r, ...payload } : r));
    return Promise.resolve(_races.find((r) => r.id === id));
  },
  remove: (id) => {
    _races = _races.filter((r) => r.id !== id);
    return Promise.resolve({ success: true });
  },
  setStatus: (id, status) => {
    _races = _races.map((r) => (r.id === id ? { ...r, status } : r));
    return Promise.resolve(_races.find((r) => r.id === id));
  },
};

// RaceResponse: { raceId, raceName, scheduledTime, distanceMeters, meetingName, status, ... }
// Frontend JSX dùng: { id, name, raceTime, distance, meetingName, status }
const mapRace = (r) => ({
  id: r.raceId,
  name: r.raceName,
  raceTime: r.scheduledTime,
  distance: r.distanceMeters,
  meetingId: r.meetingId,
  meetingName: r.meetingName,
  conditionId: r.conditionId,
  staffId: r.staffId,
  staffName: r.staffName,
  refereeId: r.refereeId,
  refereeName: r.refereeName,
  raceNo: r.raceNo,
  registrationOpenAt: r.registrationOpenAt,
  registrationCloseAt: r.registrationCloseAt,
  status: r.status,
  resultStatus: r.resultStatus,
});
const mapRaces = (list) => (Array.isArray(list) ? list.map(mapRace) : []);

// RaceRequest: { meetingId, conditionId, raceName, raceNo, scheduledTime, ... }
// JSX form sends: { meetingId, name, raceTime, distance, ... }
const toRacePayload = ({
  name, raceName, raceTime, scheduledTime,
  distance, distanceMeters,
  meetingId, conditionId, status, raceNo,
  registrationOpenAt, registrationCloseAt,
  staffId, refereeId,
}) => ({
  raceName: raceName || name,
  meetingId: meetingId ? Number(meetingId) : undefined,
  conditionId: conditionId ? Number(conditionId) : undefined,
  scheduledTime: scheduledTime || raceTime,
  distanceMeters: distanceMeters ? Number(distanceMeters) : (distance ? Number(distance) : undefined),
  raceNo: raceNo ? Number(raceNo) : undefined,
  status: status || 'DRAFT',
  registrationOpenAt: registrationOpenAt || undefined,
  registrationCloseAt: registrationCloseAt || undefined,
  staffId: staffId ? Number(staffId) : undefined,
  refereeId: refereeId ? Number(refereeId) : undefined,
});

const realService = {
  // Admin CRUD
  getAll: () => api.get('/admin/races').then((r) => mapRaces(r.data)),
  getById: (id) => api.get(`/admin/races/${id}`).then((r) => mapRace(r.data)),
  create: (payload) => api.post('/admin/races', toRacePayload(payload)).then((r) => mapRace(r.data)),
  update: (id, payload) => api.put(`/admin/races/${id}`, toRacePayload(payload)).then((r) => mapRace(r.data)),
  remove: (id) => api.delete(`/admin/races/${id}`).then((r) => r.data),

  // Race đang mở đăng ký (chỉ gọi API chuẩn, không fallback)
  getOpen: () => api.get('/races/open').then((r) => mapRaces(r.data)),

  // Spectator / jockey xem races open
  getPublic: () => api.get('/races/open').then((r) => mapRaces(r.data)),

  // Staff races được gán (chỉ gọi API chuẩn, không fallback)
  getAssignedToStaff: () => api.get('/staff/races').then((r) => mapRaces(r.data)),
  
  // Referee: Backend chưa có API lấy danh sách giải đấu của Trọng tài.
  getAssignedToReferee: () => Promise.reject(new Error('Backend chưa có API lấy danh sách giải đấu của Trọng tài.')),

  // Đổi trạng thái race (dành cho Staff).
  setStatus: (id, status) =>
    api.patch(`/race-management/races/${id}/status`, { status }).then((r) => mapRace(r.data)),
};

export const raceService = realService;
