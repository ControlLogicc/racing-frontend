// Enum trạng thái nghiệp vụ — Mục 15 CLAUDE.md v2 (D11). AI KHÔNG cho phép hành động sai trạng thái.

export const RACE_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
};

// Registration không cần Staff duyệt (D11)
export const RACE_REGISTRATION_STATUS = {
  SUBMITTED: 'submitted',
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
};

// Invitation: Staff chỉ theo dõi deadline + loại EXPIRED — KHÔNG tạo invitation
export const RACE_INVITATION_STATUS = {
  SENT: 'sent',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',   // hết deadline, cần Staff loại khỏi race
  REMOVED: 'removed',   // Staff đã loại thủ công
};

// Entry tự tạo khi Jockey ACCEPT — Staff confirm/edit/remove (D11)
export const RACE_ENTRY_STATUS = {
  AUTO_CREATED: 'auto_created',           // vừa tự tạo, chờ Staff xem
  PENDING_CONFIRMATION: 'pending_confirmation', // Staff đang xem xét
  CONFIRMED: 'confirmed',                 // Staff đã xác nhận chính thức
  REMOVED: 'removed',                     // Staff đã loại
};

// Result: multi-step qua Referee rồi Staff publish
export const RACE_RESULT_STATUS = {
  DRAFT: 'draft',
  REVIEWED_BY_REFEREE: 'reviewed_by_referee',
  FINAL_EDITED_BY_STAFF: 'final_edited_by_staff',
  PUBLISHED: 'published',
};

export const PAYOUT_STATUS = {
  PENDING: 'pending',
  PROCESSED: 'processed',
  FAILED: 'failed',
};

export const STATUS_LABEL = {
  // Race
  [RACE_STATUS.UPCOMING]: 'Sắp diễn ra',
  [RACE_STATUS.ONGOING]: 'Đang diễn ra',
  [RACE_STATUS.COMPLETED]: 'Đã hoàn thành',
  // Registration (cũ + mới)
  [RACE_REGISTRATION_STATUS.SUBMITTED]: 'Đã nộp',
  [RACE_REGISTRATION_STATUS.ACTIVE]: 'Đang hoạt động',
  [RACE_REGISTRATION_STATUS.CANCELLED]: 'Đã huỷ',
  // Invitation
  [RACE_INVITATION_STATUS.SENT]: 'Đã gửi',
  [RACE_INVITATION_STATUS.ACCEPTED]: 'Đã nhận',
  [RACE_INVITATION_STATUS.DECLINED]: 'Đã từ chối',
  [RACE_INVITATION_STATUS.EXPIRED]: 'Hết hạn',
  [RACE_INVITATION_STATUS.REMOVED]: 'Đã xoá',
  // Entry
  [RACE_ENTRY_STATUS.AUTO_CREATED]: 'Tự động tạo',
  [RACE_ENTRY_STATUS.PENDING_CONFIRMATION]: 'Chờ xác nhận',
  [RACE_ENTRY_STATUS.CONFIRMED]: 'Đã xác nhận',
  [RACE_ENTRY_STATUS.REMOVED]: 'Đã xoá',
  // Result
  [RACE_RESULT_STATUS.DRAFT]: 'Bản nháp',
  [RACE_RESULT_STATUS.REVIEWED_BY_REFEREE]: 'Referee đã review',
  [RACE_RESULT_STATUS.FINAL_EDITED_BY_STAFF]: 'Staff đã chỉnh',
  [RACE_RESULT_STATUS.PUBLISHED]: 'Đã công bố',
  // Payout
  [PAYOUT_STATUS.PENDING]: 'Chờ xử lý',
  [PAYOUT_STATUS.PROCESSED]: 'Đã xử lý',
  [PAYOUT_STATUS.FAILED]: 'Thất bại',
};

export const STATUS_BADGE_VARIANT = {
  // Race
  [RACE_STATUS.UPCOMING]: 'info',
  [RACE_STATUS.ONGOING]: 'warning',
  [RACE_STATUS.COMPLETED]: 'success',
  // Registration
  [RACE_REGISTRATION_STATUS.SUBMITTED]: 'secondary',
  [RACE_REGISTRATION_STATUS.ACTIVE]: 'success',
  [RACE_REGISTRATION_STATUS.CANCELLED]: 'danger',
  // Invitation
  [RACE_INVITATION_STATUS.SENT]: 'warning',
  [RACE_INVITATION_STATUS.ACCEPTED]: 'success',
  [RACE_INVITATION_STATUS.DECLINED]: 'danger',
  [RACE_INVITATION_STATUS.EXPIRED]: 'dark',
  [RACE_INVITATION_STATUS.REMOVED]: 'secondary',
  // Entry
  [RACE_ENTRY_STATUS.AUTO_CREATED]: 'info',
  [RACE_ENTRY_STATUS.PENDING_CONFIRMATION]: 'warning',
  [RACE_ENTRY_STATUS.CONFIRMED]: 'success',
  [RACE_ENTRY_STATUS.REMOVED]: 'secondary',
  // Result
  [RACE_RESULT_STATUS.DRAFT]: 'secondary',
  [RACE_RESULT_STATUS.REVIEWED_BY_REFEREE]: 'info',
  [RACE_RESULT_STATUS.FINAL_EDITED_BY_STAFF]: 'warning',
  [RACE_RESULT_STATUS.PUBLISHED]: 'success',
  // Payout
  [PAYOUT_STATUS.PENDING]: 'warning',
  [PAYOUT_STATUS.PROCESSED]: 'success',
  [PAYOUT_STATUS.FAILED]: 'danger',
};

// Entry có thể confirm khi AUTO_CREATED hoặc PENDING_CONFIRMATION
export const canConfirmEntry = (entryStatus) =>
  entryStatus === RACE_ENTRY_STATUS.AUTO_CREATED ||
  entryStatus === RACE_ENTRY_STATUS.PENDING_CONFIRMATION;

// RACE_RESULT chỉ nhập được khi race đã COMPLETED
export const canEnterResult = (raceStatus) => raceStatus === RACE_STATUS.COMPLETED;

// Staff publish result khi đã qua referee review
export const canPublishResult = (resultStatus) =>
  resultStatus === RACE_RESULT_STATUS.FINAL_EDITED_BY_STAFF;

