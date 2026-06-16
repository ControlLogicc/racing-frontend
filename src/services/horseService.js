import { MOCK_HORSES } from '../mocks/mockHorses';

let horses = [...MOCK_HORSES];
let nextId = horses.length + 1;

export const horseService = {
  getAll: () => Promise.resolve(horses), // 🟡 mock — khi có API: api.get('/horses').then(r => r.data)
  getByOwner: (ownerId) => Promise.resolve(horses.filter((h) => h.ownerId === ownerId)),
  create: (payload) => {
    const created = { id: nextId++, ...payload };
    horses = [...horses, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    horses = horses.map((h) => (h.id === id ? { ...h, ...payload } : h));
    return Promise.resolve(horses.find((h) => h.id === id));
  },
  remove: (id) => {
    horses = horses.filter((h) => h.id !== id);
    return Promise.resolve({ success: true });
  },
};
