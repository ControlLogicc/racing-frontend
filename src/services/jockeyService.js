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

const realService = {
  // Profile (GET/PUT /api/jockey/profile)
  getProfile: () => api.get('/jockey/profile').then(r => mapJockeyProfile(r.data)),
  updateProfile: (payload) => api.put('/jockey/profile', payload).then(r => mapJockeyProfile(r.data)),

  // Race Registrations
  // POST /api/jockey/race-registrations
  registerForRace: (payload) => api.post('/jockey/race-registrations', payload).then(r => r.data),
  
  // GET /api/jockey/race-registrations/my
  getMyRaceRegistrations: () => api.get('/jockey/race-registrations/my').then(r => Array.isArray(r.data) ? r.data : []),

  // GET /api/jockeys/available-races
  getAvailableRaces: () => api.get('/jockeys/available-races').then(r => Array.isArray(r.data) ? r.data : []),
};

export const jockeyService = USE_MOCK ? mockService : realService;
