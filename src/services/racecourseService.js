import api from './api';
import { MOCK_RACECOURSES } from '../mocks/mockRacecourses';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// RacecourseResponse: { racecourseId, racecourseName, location, surfaceType, capacity, createdAt }
const mapCourse = (c) => ({
  id: c.racecourseId,
  racecourseId: c.racecourseId,
  name: c.racecourseName,
  racecourseName: c.racecourseName,
  location: c.location,
  surfaceType: c.surfaceType,
  capacity: c.capacity,
  createdAt: c.createdAt,
});
const mapCourses = (list) => (Array.isArray(list) ? list.map(mapCourse) : []);

const toPayload = ({ name, racecourseName, location, surfaceType, capacity }) => ({
  racecourseName: racecourseName || name,
  location: location || '',
  surfaceType: surfaceType || '',
  capacity: capacity ? Number(capacity) : null,
});

let _racecourses = [...MOCK_RACECOURSES];
let _nextId = Math.max(..._racecourses.map((course) => course.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._racecourses]),
  getById: (id) => Promise.resolve(_racecourses.find((course) => Number(course.id) === Number(id)) ?? null),
  create: (payload) => {
    const normalized = toPayload(payload);
    const created = {
      id: _nextId,
      racecourseId: _nextId,
      name: normalized.racecourseName,
      ...normalized,
      createdAt: new Date().toISOString(),
    };
    _nextId += 1;
    _racecourses = [..._racecourses, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    const normalized = toPayload(payload);
    _racecourses = _racecourses.map((course) => (
      Number(course.id) === Number(id)
        ? { ...course, name: normalized.racecourseName, ...normalized }
        : course
    ));
    return Promise.resolve(_racecourses.find((course) => Number(course.id) === Number(id)));
  },
  remove: (id) => {
    _racecourses = _racecourses.filter((course) => Number(course.id) !== Number(id));
    return Promise.resolve({ success: true });
  },
};

const realService = {
  getAll: () => api.get('/admin/racecourses').then((r) => mapCourses(r.data)),
  getById: (id) => api.get(`/admin/racecourses/${id}`).then((r) => mapCourse(r.data)),
  create: (payload) => api.post('/admin/racecourses', toPayload(payload)).then((r) => mapCourse(r.data)),
  update: (id, payload) => api.put(`/admin/racecourses/${id}`, toPayload(payload)).then((r) => mapCourse(r.data)),
  remove: (id) => api.delete(`/admin/racecourses/${id}`).then((r) => r.data),
};

export const racecourseService = USE_MOCK ? mockService : realService;
