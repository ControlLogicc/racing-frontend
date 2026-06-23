import api from './api';

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

export const racecourseService = {
  getAll: () => api.get('/admin/racecourses').then((r) => mapCourses(r.data)),
  getById: (id) => api.get(`/admin/racecourses/${id}`).then((r) => mapCourse(r.data)),
  create: (payload) => api.post('/admin/racecourses', toPayload(payload)).then((r) => mapCourse(r.data)),
  update: (id, payload) => api.put(`/admin/racecourses/${id}`, toPayload(payload)).then((r) => mapCourse(r.data)),
  remove: (id) => api.delete(`/admin/racecourses/${id}`).then((r) => r.data),
};
