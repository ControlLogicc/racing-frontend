import { RACE_RESULT_STATUS } from '../constants/status';

export const MOCK_RESULTS = [
  // Race #9 (raceId: 3, seasonId: 1 Spring 2026) — PUBLISHED
  { id: 1,  raceId: 3, raceName: 'Race #9',  raceDate: '2026-06-14', seasonId: 1, seasonName: 'Spring 2026', entryId: 3, horseId: 3, horseName: 'Bão Tố',   jockeyName: 'K. Pham',  position: 1, finishTime: '01:12.45', prize: 50000000, resultStatus: RACE_RESULT_STATUS.PUBLISHED,             createdAt: '2026-06-14T13:00:00' },
  { id: 4,  raceId: 3, raceName: 'Race #9',  raceDate: '2026-06-14', seasonId: 1, seasonName: 'Spring 2026', entryId: 7, horseId: 1, horseName: 'Thần Mã',  jockeyName: 'T. Nguyen', position: 2, finishTime: '01:13.10', prize: 20000000, resultStatus: RACE_RESULT_STATUS.PUBLISHED,             createdAt: '2026-06-14T13:00:00' },
  { id: 5,  raceId: 3, raceName: 'Race #9',  raceDate: '2026-06-14', seasonId: 1, seasonName: 'Spring 2026', entryId: 8, horseId: 2, horseName: 'Phi Long',  jockeyName: 'V. Do',    position: 3, finishTime: '01:14.22', prize: 10000000, resultStatus: RACE_RESULT_STATUS.PUBLISHED,             createdAt: '2026-06-14T13:00:00' },

  // Race #10 (raceId: 4, seasonId: 1 Spring 2026) — FINAL_EDITED_BY_STAFF
  { id: 2,  raceId: 4, raceName: 'Race #10', raceDate: '2026-06-15', seasonId: 1, seasonName: 'Spring 2026', entryId: 5, horseId: 2, horseName: 'Phi Long',  jockeyName: 'L. Tran',  position: 1, finishTime: '01:45.20', prize: 50000000, resultStatus: RACE_RESULT_STATUS.FINAL_EDITED_BY_STAFF, createdAt: '2026-06-15T17:00:00' },
  { id: 3,  raceId: 4, raceName: 'Race #10', raceDate: '2026-06-15', seasonId: 1, seasonName: 'Spring 2026', entryId: 6, horseId: 1, horseName: 'Thần Mã',  jockeyName: 'M. Le',    position: 2, finishTime: '01:46.10', prize: 20000000, resultStatus: RACE_RESULT_STATUS.FINAL_EDITED_BY_STAFF, createdAt: '2026-06-15T17:00:00' },

  // Race #7 (raceId: 5, seasonId: 3 Winter 2025) — PUBLISHED
  { id: 6,  raceId: 5, raceName: 'Race #7',  raceDate: '2025-12-10', seasonId: 3, seasonName: 'Winter 2025', entryId: 9,  horseId: 1, horseName: 'Thần Mã',  jockeyName: 'L. Tran',  position: 1, finishTime: '00:58.30', prize: 25000000, resultStatus: RACE_RESULT_STATUS.PUBLISHED,             createdAt: '2025-12-10T15:00:00' },
  { id: 7,  raceId: 5, raceName: 'Race #7',  raceDate: '2025-12-10', seasonId: 3, seasonName: 'Winter 2025', entryId: 10, horseId: 2, horseName: 'Phi Long',  jockeyName: 'M. Le',    position: 3, finishTime: '01:00.15', prize: 5000000,  resultStatus: RACE_RESULT_STATUS.PUBLISHED,             createdAt: '2025-12-10T15:00:00' },
];
