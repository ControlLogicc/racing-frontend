import { MOCK_RACES } from '../mocks/mockRaces';
import { RACE_STATUS } from '../constants/status';

let races = [...MOCK_RACES];
let nextId = races.length + 1;

export const raceService = {
  getAll: () => Promise.resolve(races), // 🟡 mock — khi có API: api.get('/races').then(r => r.data)
  getAssignedToReferee: (refereeId) =>
    Promise.resolve(races.filter((r) => r.assignedRefereeIds?.includes(refereeId))),
  // 🟡 mock — khi có API: api.get('/races', { params: { refereeId } }).then(r => r.data)
  create: (payload) => {
    const created = { id: nextId++, status: RACE_STATUS.UPCOMING, assignedRefereeIds: [], ...payload };
    races = [...races, created];
    return Promise.resolve(created);
  },
  update: (id, payload) => {
    races = races.map((r) => (r.id === id ? { ...r, ...payload } : r));
    return Promise.resolve(races.find((r) => r.id === id));
  },
  remove: (id) => {
    races = races.filter((r) => r.id !== id);
    return Promise.resolve({ success: true });
  },
  setStatus: (id, status) => {
    races = races.map((r) => (r.id === id ? { ...r, status } : r));
    return Promise.resolve(races.find((r) => r.id === id));
  },
};
