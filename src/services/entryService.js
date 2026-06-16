import { MOCK_ENTRIES } from '../mocks/mockEntries';

let entries = [...MOCK_ENTRIES];
let nextId = entries.length + 1;

export const entryService = {
  getAll: () => Promise.resolve(entries), // 🟡 mock — khi có API: api.get('/race-entries').then(r => r.data)
  getByJockey: (jockeyId) => Promise.resolve(entries.filter((e) => e.jockeyId === jockeyId)),
  // RACE_ENTRY chỉ tạo khi registration=APPROVED và có invitation ACCEPTED (Mục 15 CLAUDE.md)
  confirm: (payload) => {
    const created = { id: nextId++, confirmedAt: new Date().toISOString(), ...payload };
    entries = [...entries, created];
    return Promise.resolve(created);
  },
};
