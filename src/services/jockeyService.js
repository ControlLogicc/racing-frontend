import api from './api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const mockProfile = {
  jockeyId: 1,
  userId: 1,
  fullName: 'Mock Jockey',
  weight: 55,
  experienceYears: 5,
  height: 170,
  nationality: 'VN',
  licenseNumber: 'L-12345',
  achievements: 'First place in Mock Race 1',
  imageUrl: 'https://example.com/mock-jockey.jpg',
  dateOfBirth: '1995-01-01',
};

const mockRegistrations = [];

const mockService = {
  getProfile: () => Promise.resolve(mockProfile),
  updateProfile: (payload) => Promise.resolve({ ...mockProfile, ...payload }),
  registerForRace: (payload) => Promise.resolve({ id: 1, ...payload }),
  getMyRaceRegistrations: () => Promise.resolve([...mockRegistrations]),
  getAvailableRaces: () => Promise.resolve([{
    id: 1,
    name: 'Giải Đua Mock',
    raceTime: new Date().toISOString(),
    distance: 1000,
    racecourseName: 'Mock Racecourse',
    meetingName: 'Mock Meeting',
    status: 'OPEN_FOR_ENTRY',
  }]),
};

const mapJockeyProfile = (data) => ({
  id: data.jockeyId,
  jockeyId: data.jockeyId,
  userId: data.userId,
  weight: data.weight,
  experienceYears: data.experienceYears,
  fullName: data.fullName,
  height: data.height,
  nationality: data.nationality,
  licenseNumber: data.license_number ?? data.licenseNumber,
  achievements: data.achievements,
  imageUrl: data.image_url ?? data.imageUrl,
  dateOfBirth: data.date_of_birth ?? data.dateOfBirth,
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
  id: r.raceId ?? r.id,
  raceId: r.raceId ?? r.id,
  name: r.raceName ?? r.name,
  raceName: r.raceName ?? r.name,
  raceTime: r.scheduledTime ?? r.raceTime,
  scheduledTime: r.scheduledTime ?? r.raceTime,
  status: r.status,
  distance: r.distanceMeters ?? r.distance,
  racecourseName: r.racecourseName,
  meetingName: r.meetingName,
  trackType: r.trackType,
  classRequirement: r.classRequirement,
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
