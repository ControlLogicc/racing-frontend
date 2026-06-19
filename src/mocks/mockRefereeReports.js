export const VIOLATION_TYPE = {
  NONE: 'none',
  INTERFERENCE: 'interference',
  EQUIPMENT: 'equipment',
  WEIGHT: 'weight',
  CONDUCT: 'conduct',
};

export const DECISION = {
  NO_ACTION: 'no_action',
  WARNING: 'warning',
  DEMOTED: 'demoted',
  DISQUALIFIED: 'disqualified',
};

export const VIOLATION_LABEL = {
  none: 'Không vi phạm',
  interference: 'Cản trở',
  equipment: 'Trang thiết bị',
  weight: 'Trọng lượng',
  conduct: 'Hành vi',
};

export const DECISION_LABEL = {
  no_action: 'Không xử lý',
  warning: 'Cảnh cáo',
  demoted: 'Hạ thứ hạng',
  disqualified: 'Loại khỏi cuộc đua',
};

export const DECISION_BADGE = {
  no_action: 'secondary',
  warning: 'warning',
  demoted: 'info',
  disqualified: 'danger',
};

export const MOCK_REFEREE_REPORTS = [
  {
    id: 1,
    raceId: 3,
    raceName: 'Race #9',
    refereeId: 3,
    refereeName: 'Referee User',
    violationType: VIOLATION_TYPE.NONE,
    decision: DECISION.NO_ACTION,
    content: 'Không có vi phạm. Cuộc đua diễn ra bình thường.',
    createdAt: '2026-06-14T13:00:00',
  },
  {
    id: 2,
    raceId: 4,
    raceName: 'Race #10',
    refereeId: 3,
    refereeName: 'Referee User',
    violationType: VIOLATION_TYPE.INTERFERENCE,
    decision: DECISION.DEMOTED,
    content: 'Jockey #5 cản trở đối thủ ở khúc cua cuối. Hạ từ vị trí 2 xuống vị trí 4.',
    createdAt: '2026-06-15T16:30:00',
  },
  {
    id: 3,
    raceId: 4,
    raceName: 'Race #10',
    refereeId: 3,
    refereeName: 'Referee User',
    violationType: VIOLATION_TYPE.WEIGHT,
    decision: DECISION.WARNING,
    content: 'Ngựa số 3 vượt giới hạn trọng lượng 0.5kg. Phạt cảnh cáo.',
    createdAt: '2026-06-15T17:00:00',
  },
];
