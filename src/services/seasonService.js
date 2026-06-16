import { MOCK_SEASONS } from '../mocks/mockSeasons';

let seasons = [...MOCK_SEASONS];
let nextId = seasons.length + 1;

export const seasonService = {
  getAll: () => Promise.resolve(seasons), // 🟡 mock — khi có API: api.get('/seasons').then(r => r.data)
  create: (payload) => {
    const created = { id: nextId++, ...payload };
    seasons = [...seasons, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    seasons = seasons.map((s) => (s.id === id ? { ...s, ...payload } : s));
    return Promise.resolve(seasons.find((s) => s.id === id));
  },
  remove: (id) => {
    seasons = seasons.filter((s) => s.id !== id);
    return Promise.resolve({ success: true });
  },
};
