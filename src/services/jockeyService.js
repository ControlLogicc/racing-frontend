import api from './api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const mockProfile = {
  jockeyId: 1,
  userId: 1,
  fullName: 'Mock Jockey',
  weight: 55,
  experienceYears: 5,
};

const mockRegistrations = [];

const mockService = {
  getProfile: () => Promise.resolve(mockProfile),
  updateProfile: (payload) => Promise.resolve({ ...mockProfile, ...payload }),
  registerForRace: (payload) => Promise.resolve({ id: 1, ...payload }),
  getMyRaceRegistrations: () => Promise.resolve([...mockRegistrations]),
  getAvailableRaces: () => Promise.resolve([{ id: 1, name: 'Giải Đua Mock', raceTime: new Date().toISOString(), distance: 1000, status: 'OPEN_FOR_ENTRY' }]),
};

const mapJockeyProfile = (data) => ({
  id: data.jockeyId,
  jockeyId: data.jockeyId,
  userId: data.userId,
  weight: data.weight,
  experienceYears: data.experienceYears,
  fullName: data.fullName,
});

const mapJockeyReg = (r) => ({
  id: r.jockeyRaceRegistrationId,
  raceId: r.raceId,
  raceName: r.raceName,
  jockeyId: r.jockeyId,
  jockeyName: r.jockeyName,
  status: r.registrationStatus ?? r.status,
  note: r.note,
  registeredAt: r.registeredAt,
  scheduledTime: r.scheduledTime,
});

const mapRace = (r) => ({
  id: r.raceId,
  raceId: r.raceId,
  name: r.raceName,
  raceName: r.raceName,
  raceTime: r.scheduledTime,
  scheduledTime: r.scheduledTime,
  status: r.status,
  distance: r.distanceMeters,
  registrationOpenAt: r.registrationOpenAt,
  registrationCloseAt: r.registrationCloseAt,
});

const realService = {
  // Profile (GET/PUT /api/jockey/profile)
  getProfile: () => api.get('/jockey/profile').then(r => mapJockeyProfile(r.data)),
  updateProfile: (payload) => api.put('/jockey/profile', payload).then(r => mapJockeyProfile(r.data)),

  // Race Registrations
  // POST /api/jockey/race-registrations — { raceId, note? }
  registerForRace: (payload) => api.post('/jockey/race-registrations', payload).then(r => r.data),

  // GET /api/jockey/race-registrations/my
  getMyRaceRegistrations: () =>
    api.get('/jockey/race-registrations/my')
      .then(r => Array.isArray(r.data) ? r.data.map(mapJockeyReg) : []),

  // GET /api/races/open — races đang mở đăng ký cho Jockey
  getAvailableRaces: () =>
    api.get('/races/open')
      .then(r => Array.isArray(r.data) ? r.data.map(mapRace) : [])
      .catch(() => []),
};

export const jockeyService = USE_MOCK ? mockService : realService;
