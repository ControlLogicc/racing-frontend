import { MOCK_RESULTS } from '../mocks/mockResults';

let results = [...MOCK_RESULTS];
let nextId = results.length + 1;

export const resultService = {
  getAll: () => Promise.resolve(results), // 🟡 mock — khi có API: api.get('/race-results').then(r => r.data)
  // RACE_RESULT chỉ nhập được khi race COMPLETED (Mục 15 CLAUDE.md) — guard ở page, không ở service
  create: (payload) => {
    const created = { id: nextId++, ...payload };
    results = [...results, created];
    return Promise.resolve(created);
  },
};
