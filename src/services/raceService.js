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
  getAssignedToStaff: () => Promise.resolve([..._races]),
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
  id: r.raceId ?? r.id,
  name: r.raceName ?? r.name,
  raceTime: r.scheduledTime ?? r.raceTime,
  distance: r.distanceMeters ?? r.distance,
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
  assignedRefereeIds: r.assignedRefereeIds,
});
const mapRaces = (list) => (Array.isArray(list) ? list.map(mapRace) : []);

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const asNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const buildRefereeIdentity = async (refereeInput) => {
  const currentUser = getCurrentUser();
  const source = typeof refereeInput === 'object' && refereeInput !== null
    ? { ...currentUser, ...refereeInput }
    : { ...currentUser, userId: refereeInput };

  const ids = new Set(
    [source?.refereeId, source?.id, source?.userId]
      .map(asNumber)
      .filter((value) => value !== null)
  );

  try {
    const referees = await api.get('/referees').then((r) => (Array.isArray(r.data) ? r.data : []));
    const matched = referees.find((referee) => {
      const refereeUserId = asNumber(referee.userId);
      const refereeId = asNumber(referee.refereeId ?? referee.id);
      return ids.has(refereeUserId) || ids.has(refereeId)
        || (source?.email && referee.email === source.email)
        || (source?.fullName && referee.fullName === source.fullName);
    });

    if (matched) {
      [matched.refereeId, matched.id, matched.userId]
        .map(asNumber)
        .filter((value) => value !== null)
        .forEach((value) => ids.add(value));
    }
  } catch {
    // Some backends restrict /referees. The ids from the login payload are still usable.
  }

  return {
    ids,
    fullName: source?.fullName,
    email: source?.email,
  };
};

const isAssignedToReferee = (race, identity) => {
  if (!race) return false;
  const raceRefereeId = asNumber(race.refereeId);
  const assignedIds = Array.isArray(race.assignedRefereeIds)
    ? race.assignedRefereeIds.map(asNumber).filter((value) => value !== null)
    : [];

  return (raceRefereeId !== null && identity.ids.has(raceRefereeId))
    || assignedIds.some((id) => identity.ids.has(id))
    || (identity.fullName && race.refereeName === identity.fullName)
    || (identity.email && race.refereeEmail === identity.email);
};

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

  // Race đang mở đăng ký — thử /races/open, fallback /races filtered by status
  getOpen: async () => {
    try {
      const data = await api.get('/races/open').then((r) => r.data);
      // eslint-disable-next-line no-console
      console.info('[raceService.getOpen] /races/open →', data);
      return mapRaces(data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[raceService.getOpen] /races/open failed:', e?.response?.status, e?.message, '— trying /races fallback');
      try {
        const data = await api.get('/races').then((r) => r.data);
        // eslint-disable-next-line no-console
        console.info('[raceService.getOpen] /races fallback →', data);
        return mapRaces(data).filter((race) => race.status === RACE_STATUS.OPEN_FOR_ENTRY);
      } catch (e2) {
        // eslint-disable-next-line no-console
        console.warn('[raceService.getOpen] /races fallback also failed:', e2?.response?.status, e2?.message);
        return [];
      }
    }
  },

  // Spectator / jockey — thử /races (nếu có), fallback /races/open
  getPublic: async () => {
    try {
      return await api.get('/races').then((r) => mapRaces(r.data));
    } catch {
      return api.get('/races/open').then((r) => mapRaces(r.data)).catch(() => []);
    }
  },

  // Staff races được gán — fallback admin races nếu /staff/races chưa implement
  getAssignedToStaff: async () => {
    try {
      return await api.get('/staff/races').then((r) => mapRaces(r.data));
    } catch {
      return api.get('/admin/races').then((r) => mapRaces(r.data)).catch(() => []);
    }
  },
  // Referee: ưu tiên endpoint theo JWT; fallback resolve userId -> refereeId rồi lọc admin races.
  getAssignedToReferee: async (refereeInput) => {
    try {
      const ownRaces = await api.get('/referee/races').then((r) => mapRaces(r.data));
      if (ownRaces.length) return ownRaces;
    } catch {
      // Fallback below handles projects where /referee/races is not implemented yet.
    }

    try {
      const identity = await buildRefereeIdentity(refereeInput);
      if (!identity.ids.size && !identity.fullName && !identity.email) return [];

      const races = await api.get('/admin/races').then((r) => mapRaces(r.data));
      return races.filter((race) => isAssignedToReferee(race, identity));
    } catch {
      return [];
    }
  },

  // Đổi trạng thái race (dành cho Staff).
  // Admin nên dùng hàm `update` (PUT) với full payload.
  setStatus: (id, status) =>
    api.patch(`/race-management/races/${id}/status`, { status }).then((r) => mapRace(r.data)),
};

export const raceService = USE_MOCK ? mockService : realService;
