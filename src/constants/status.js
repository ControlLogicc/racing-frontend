// Enum trạng thái nghiệp vụ — căn theo state machine diagram (2024-06)
// Thứ tự enum = thứ tự vòng đời nghiệp vụ

// ─── RACE ─────────────────────────────────────────────────────────────────────
// Draft → Scheduled → Open_For_Entries → Entries_Closed → Entry_List_Finalized
// → Racecard_Published → Running → Provisional_Result → Under_Review
// → Official_Result → Closed   (hoặc Cancelled bất kỳ lúc)
// Enum khớp chính xác với BE Java enum RaceStatus
export const RACE_STATUS = {
  DRAFT:              'DRAFT',
  SCHEDULED:          'SCHEDULED',
  OPEN_FOR_ENTRY:     'OPEN_FOR_ENTRY',      // BE: OPEN_FOR_ENTRY (singular)
  CLOSED_FOR_ENTRY:   'CLOSED_FOR_ENTRY',
  RUNNING:            'RUNNING',
  RESULT_PENDING:     'RESULT_PENDING',
  OFFICIAL:           'OFFICIAL',
  CANCELLED:          'CANCELLED',

  // Aliases diagram (FE-only, không gửi lên BE)
  OPEN_FOR_ENTRIES:       'OPEN_FOR_ENTRY',
  ENTRIES_CLOSED:         'CLOSED_FOR_ENTRY',
  PROVISIONAL_RESULT:     'RESULT_PENDING',
  OFFICIAL_RESULT:        'OFFICIAL',
};

// Enum khớp chính xác với BE Java enum RegistrationStatus
// Flow: PENDING → APPROVED (Staff duyệt) → Owner invite Jockey
//                → REJECTED (Staff từ chối)
export const RACE_REGISTRATION_STATUS = {
  PENDING:   'PENDING',    // vừa tạo, chờ Staff duyệt
  APPROVED:  'APPROVED',   // Staff duyệt → Owner được mời Jockey
  REJECTED:  'REJECTED',   // Staff từ chối

  // Aliases diagram/code cũ (không gửi lên BE)
  SUBMITTED:                     'PENDING',
  PENDING_REVIEW:                'PENDING',
  ACTIVE:                        'APPROVED',
  CANCELLED:                     'REJECTED',
  WAITING_FOR_JOCKEY_INVITATION: 'APPROVED',
  JOCKEY_ACCEPTED:               'APPROVED',
  CONVERTED_TO_ENTRY:            'APPROVED',
};

// Enum khớp chính xác với BE Java enum RaceInvitationStatus
// DRAFT → SENT → PENDING_RESPONSE → ACCEPTED (auto tạo RaceEntry) | DECLINED | EXPIRED
export const RACE_INVITATION_STATUS = {
  DRAFT:            'DRAFT',
  SENT:             'SENT',
  PENDING_RESPONSE: 'PENDING_RESPONSE',
  ACCEPTED:         'ACCEPTED',   // Jockey accept → BE tự tạo RaceEntry declared
  DECLINED:         'DECLINED',
  CANCELLED:        'CANCELLED',
  EXPIRED:          'EXPIRED',
  USED:             'USED',

  // Aliases diagram/code cũ
  INVITATION_CREATED:          'DRAFT',
  WAITING_FOR_JOCKEY_RESPONSE: 'PENDING_RESPONSE',
  REJECTED:                    'DECLINED',
  REMOVED:                     'CANCELLED',
};

// ─── RACE ENTRY ───────────────────────────────────────────────────────────────
// Declared → Pre_Race_Check → Ready_To_Race → Running → Finished
// → Referee_Review → Valid_Result | Penalized | Disqualified | Did_Not_Finish
// (hoặc Scratched bất kỳ lúc trước khi Running)
export const RACE_ENTRY_STATUS = {
  DECLARED:       'declared',
  PRE_RACE_CHECK: 'pre_race_check',
  READY_TO_RACE:  'ready_to_race',
  RUNNING:        'running',
  FINISHED:       'finished',
  REFEREE_REVIEW: 'referee_review',
  VALID_RESULT:   'valid_result',
  PENALIZED:      'penalized',
  DISQUALIFIED:   'disqualified',
  DID_NOT_FINISH: 'dnf',
  SCRATCHED:      'scratched',

  // Aliases backend cũ
  READY:      'ready_to_race',
  CHECKED_IN: 'pre_race_check',
  DNF:        'dnf',
  REMOVED:    'scratched',
};

// ─── RACE RESULT ──────────────────────────────────────────────────────────────
export const RACE_RESULT_STATUS = {
  DRAFT:                  'DRAFT',
  REVIEWED_BY_REFEREE:    'REVIEWED_BY_REFEREE',
  FINAL_EDITED_BY_STAFF:  'FINAL_EDITED_BY_STAFF',
  PUBLISHED:              'PUBLISHED',
  OFFICIAL:               'OFFICIAL',
};

// ─── PAYOUT ───────────────────────────────────────────────────────────────────
export const PAYOUT_STATUS = {
  PENDING:   'pending',
  PROCESSED: 'processed',
  FAILED:    'failed',
};

// ─── LABEL (hiển thị tiếng Việt) ──────────────────────────────────────────────
export const STATUS_LABEL = {
  // Race
  DRAFT:                    'Bản nháp',
  SCHEDULED:                'Đã lên lịch',
  OPEN_FOR_ENTRIES:         'Mở đăng ký',
  OPEN_FOR_ENTRY:           'Mở đăng ký',
  ENTRIES_CLOSED:           'Đóng đăng ký',
  CLOSED_FOR_ENTRY:         'Đóng đăng ký',
  ENTRY_LIST_FINALIZED:     'Danh sách chốt',
  RACECARD_PUBLISHED:       'Đã công bố race card',
  RUNNING:                  'Đang diễn ra',
  PROVISIONAL_RESULT:       'Kết quả tạm thời',
  RESULT_PENDING:           'Kết quả tạm thời',
  UNDER_REVIEW:             'Đang review',
  OFFICIAL_RESULT:          'Kết quả chính thức',
  OFFICIAL:                 'Kết quả chính thức',
  CLOSED:                   'Đã kết thúc',
  CANCELLED:                'Đã huỷ',

  // Registration (BE: PENDING / APPROVED / REJECTED)
  PENDING:   'Chờ duyệt',
  APPROVED:  'Đã duyệt',
  REJECTED:  'Từ chối',

  // Invitation (BE: DRAFT / SENT / PENDING_RESPONSE / ACCEPTED / DECLINED / CANCELLED / EXPIRED / USED)
  DRAFT:            'Bản nháp',
  SENT:             'Đã gửi',
  PENDING_RESPONSE: 'Chờ phản hồi',
  ACCEPTED:         'Đã chấp nhận',
  DECLINED:         'Đã từ chối',
  USED:             'Đã dùng',
  EXPIRED:          'Hết hạn',
  CANCELLED:        'Đã huỷ',

  // Entry (lowercase — backend gửi lowercase)
  declared:       'Chính thức',
  pre_race_check: 'Kiểm tra trước đua',
  checked_in:     'Kiểm tra trước đua',
  ready_to_race:  'Sẵn sàng',
  ready:          'Sẵn sàng',
  running:        'Đang chạy',
  finished:       'Hoàn thành',
  referee_review: 'Referee review',
  valid_result:   'Kết quả hợp lệ',
  penalized:      'Bị phạt',
  disqualified:   'Truất quyền',
  dnf:            'Không hoàn thành',
  scratched:      'Đã loại',

  // Result
  REVIEWED_BY_REFEREE:   'Referee đã review',
  FINAL_EDITED_BY_STAFF: 'Staff đã chỉnh',
  PUBLISHED:             'Đã công bố',

  // Payout
  PROCESSED: 'Đã xử lý',
  FAILED:    'Thất bại',
};

// ─── BADGE VARIANT (Bootstrap color) ─────────────────────────────────────────
export const STATUS_BADGE_VARIANT = {
  // Race
  DRAFT:                  'secondary',
  SCHEDULED:              'info',
  OPEN_FOR_ENTRIES:       'primary',
  OPEN_FOR_ENTRY:         'primary',
  ENTRIES_CLOSED:         'warning',
  CLOSED_FOR_ENTRY:       'warning',
  ENTRY_LIST_FINALIZED:   'warning',
  RACECARD_PUBLISHED:     'info',
  RUNNING:                'danger',
  PROVISIONAL_RESULT:     'info',
  RESULT_PENDING:         'info',
  UNDER_REVIEW:           'warning',
  OFFICIAL_RESULT:        'success',
  OFFICIAL:               'success',
  CLOSED:                 'dark',
  CANCELLED:              'dark',

  // Registration (BE: PENDING / APPROVED / REJECTED)
  PENDING:  'warning',
  APPROVED: 'success',
  REJECTED: 'danger',

  // Invitation (BE: DRAFT / SENT / PENDING_RESPONSE / ACCEPTED / DECLINED / CANCELLED / EXPIRED / USED)
  DRAFT:            'secondary',
  SENT:             'warning',
  PENDING_RESPONSE: 'warning',
  ACCEPTED:         'success',
  DECLINED:         'danger',
  USED:             'secondary',
  EXPIRED:          'dark',
  CANCELLED:        'dark',

  // Entry (lowercase)
  declared:       'success',
  pre_race_check: 'info',
  checked_in:     'info',
  ready_to_race:  'primary',
  ready:          'primary',
  running:        'danger',
  finished:       'success',
  referee_review: 'warning',
  valid_result:   'success',
  penalized:      'warning',
  disqualified:   'danger',
  dnf:            'dark',
  scratched:      'secondary',

  // Result
  REVIEWED_BY_REFEREE:   'info',
  FINAL_EDITED_BY_STAFF: 'warning',
  PUBLISHED:             'success',

  // Payout
  PROCESSED: 'success',
  FAILED:    'danger',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const isRaceOpen = (s) => s === RACE_STATUS.OPEN_FOR_ENTRY || s === 'OPEN_FOR_ENTRY';

export const canEnterResult = (s) => s === RACE_STATUS.CLOSED_FOR_ENTRY || s === 'CLOSED_FOR_ENTRY';

export const canPublishResult = (s) =>
  s === RACE_RESULT_STATUS.FINAL_EDITED_BY_STAFF || s === RACE_RESULT_STATUS.REVIEWED_BY_REFEREE;

// Registration: Staff duyệt khi PENDING
export const canStaffReviewRegistration = (s) => s === 'PENDING' || s === RACE_REGISTRATION_STATUS.PENDING;

// Registration: Owner mời Jockey chỉ khi đã được Staff APPROVED
export const canOwnerInviteJockey = (s) => s === 'APPROVED' || s === RACE_REGISTRATION_STATUS.APPROVED;
