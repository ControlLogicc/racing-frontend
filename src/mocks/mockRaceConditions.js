// race_condition — 1 race có 1 condition, liên kết qua raceId
export const MOCK_RACE_CONDITIONS = [
  { id: 1, raceId: 1, conditionName: '1800m Turf Class 1',      distance: 1800, trackType: 'turf',      minEntries: 6, maxEntries: 12, classRequirement: 'Class 1-2' },
  { id: 2, raceId: 2, conditionName: '1600m Dirt Class 2',      distance: 1600, trackType: 'dirt',      minEntries: 6, maxEntries: 12, classRequirement: 'Class 2-3' },
  { id: 3, raceId: 3, conditionName: '2000m Turf Class 3',      distance: 2000, trackType: 'turf',      minEntries: 8, maxEntries: 14, classRequirement: 'Class 3-4' },
  { id: 4, raceId: 4, conditionName: '1400m Synthetic Class 4', distance: 1400, trackType: 'synthetic', minEntries: 6, maxEntries: 12, classRequirement: 'Class 4-5' },
];
