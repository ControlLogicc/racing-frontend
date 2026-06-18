import { RACE_STATUS } from '../constants/status';

export const MOCK_RACES = [
  { id: 1, meetingId: 1, name: 'Race #12', distance: 1200, raceTime: '2026-06-20T10:00:00', status: RACE_STATUS.UPCOMING },
  { id: 2, meetingId: 1, name: 'Race #13', distance: 1600, raceTime: '2026-06-20T11:30:00', status: RACE_STATUS.UPCOMING },
  { id: 3, meetingId: 2, name: 'Race #9', distance: 1400, raceTime: '2026-06-14T09:00:00', status: RACE_STATUS.COMPLETED },
];
