import { RACE_RESULT_STATUS } from '../constants/status';

// RACE_RESULT chỉ nhập được khi race đã COMPLETED
// resultStatus: REVIEWED_BY_REFEREE → FINAL_EDITED_BY_STAFF → PUBLISHED
// prize: mock tạm đặt trực tiếp trên row (đơn vị VND).
// TODO: xác nhận với backend — prize có thể join từ PRIZE_STRUCTURES thay vì field trực tiếp.
//       Nếu backend trả về prizeId thì cập nhật field name ở đây và trong RaceResultTable.
export const MOCK_RESULTS = [
  // --- Race #9 (raceId: 3) — staff đã PUBLISHED ---
  {
    id: 1,
    raceId: 3,
    raceName: 'Race #9',
    entryId: 3,
    horseName: 'Bão Tố',
    jockeyName: 'K. Pham',
    position: 1,
    finishTime: '01:12.45',
    prize: 50000000,
    resultStatus: RACE_RESULT_STATUS.PUBLISHED,
    createdAt: '2026-06-14T13:00:00',
  },
  {
    id: 4,
    raceId: 3,
    raceName: 'Race #9',
    entryId: 7,
    horseName: 'Hoàng Kim',
    jockeyName: 'T. Nguyen',
    position: 2,
    finishTime: '01:13.10',
    prize: 20000000,
    resultStatus: RACE_RESULT_STATUS.PUBLISHED,
    createdAt: '2026-06-14T13:00:00',
  },
  {
    id: 5,
    raceId: 3,
    raceName: 'Race #9',
    entryId: 8,
    horseName: 'Lửa Thiêng',
    jockeyName: 'V. Do',
    position: 3,
    finishTime: '01:14.22',
    prize: 10000000,
    resultStatus: RACE_RESULT_STATUS.PUBLISHED,
    createdAt: '2026-06-14T13:00:00',
  },

  // --- Race #10 (raceId: 4) — staff đã chốt, chờ công bố ---
  {
    id: 2,
    raceId: 4,
    raceName: 'Race #10',
    entryId: 5,
    horseName: 'Phi Long',
    jockeyName: 'L. Tran',
    position: 1,
    finishTime: '01:45.20',
    prize: 50000000,
    resultStatus: RACE_RESULT_STATUS.FINAL_EDITED_BY_STAFF,
    createdAt: '2026-06-15T17:00:00',
  },
  {
    id: 3,
    raceId: 4,
    raceName: 'Race #10',
    entryId: 6,
    horseName: 'Thần Mã',
    jockeyName: 'M. Le',
    position: 2,
    finishTime: '01:46.10',
    prize: 20000000,
    resultStatus: RACE_RESULT_STATUS.FINAL_EDITED_BY_STAFF,
    createdAt: '2026-06-15T17:00:00',
  },
];
