import { useNavigate } from 'react-router-dom';
import '../../pages/owner/owner-theme.css';

// Dùng horseClass trực tiếp từ backend (đã lưu trong DB), không tự tính từ điểm
function getClassBadge(horseClass) {
  const c = Number(horseClass);
  if (c === 1) return { label: 'Class 1', css: 'horse-class-1' };
  if (c === 2) return { label: 'Class 2', css: 'horse-class-2' };
  if (c === 3) return { label: 'Class 3', css: 'horse-class-3' };
  if (c === 4) return { label: 'Class 4', css: 'horse-class-other' };
  return { label: 'Class 5', css: 'horse-class-other' };   // mặc định 5 khi 0 điểm
}

export default function HorseProfileCard({ horse, showHistory = false }) {
  const navigate = useNavigate();
  // horseClass: lấy từ DB (backend đã tính sẵn). Fallback sang class 5 nếu thiếu.
  const horseClass = horse.horseClass ?? 5;
  const cls = getClassBadge(horseClass);
  // Progress bar: điểm thực tế, max 600 để scale
  const ratingPct = horse.rating != null ? Math.min(100, (horse.rating / 600) * 100) : null;

  return (
    <div className="horse-card">
      {/* Header */}
      <div className="horse-card-header">
        <div className="d-flex align-items-center gap-3">
          <div className="horse-card-avatar" style={{ position: 'relative', overflow: 'hidden' }}>
            {horse.imageUrl ? (
              <img
                src={horse.imageUrl}
                alt={horse.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = ''; }}
              />
            ) : null}
            <span style={{ display: horse.imageUrl ? 'none' : '' }}>🐎</span>
            {horse.ratingVerified === false && horse.registrationType === 'PREVIOUSLY_REGISTERED' && (
              <span title={horse.claimedScore != null ? "Chờ duyệt bằng chứng" : "Bị từ chối điểm"} style={{
                position: 'absolute', top: -5, right: -5, 
                background: '#e55', width: 14, height: 14, 
                borderRadius: '50%', border: '2px solid #2a2418'
              }}></span>
            )}
          </div>
          <div className="flex-grow-1 min-width-0">
            <div className="horse-card-name d-flex align-items-center gap-2">
              {horse.name}
              {horse.ratingVerified === false && horse.registrationType === 'PREVIOUSLY_REGISTERED' && (
                <span style={{ fontSize: '0.65rem', background: 'rgba(238,85,85,0.15)', color: '#ff6b6b', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                  {horse.claimedScore != null ? 'Chờ duyệt điểm' : 'Bị từ chối điểm'}
                </span>
              )}
            </div>
            <div className="horse-card-owner">
              {horse.ownerName}
            </div>
          </div>
          {cls && (
            <span className={`horse-class-badge ${cls.css}`}>{cls.label}</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="horse-card-body">
        <div className="horse-stat-row">
          <span className="horse-stat-label">Tuổi</span>
          <span className="horse-stat-value">{horse.age} tuổi</span>
        </div>
        <div className="horse-stat-row">
          <span className="horse-stat-label">Giống</span>
          <span className="horse-stat-value">{horse.breed || '—'}</span>
        </div>
        <div className="horse-stat-row">
          <span className="horse-stat-label">Hạng</span>
          <span className={`horse-class-badge ${cls.css}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>{cls.label}</span>
        </div>

        {ratingPct != null && (
          <div className="horse-rating-wrap">
            <div className="horse-rating-label">
              <span>Rating</span>
              <span>{horse.rating}</span>
            </div>
            <div className="horse-rating-track">
              <div
                className="horse-rating-fill"
                style={{ width: `${ratingPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {showHistory && (
        <div className="horse-card-footer">
          <button
            className="btn-gold btn-gold-sm w-100"
            style={{ padding: '8px 0', fontSize: '0.82rem', letterSpacing: '0.5px' }}
            onClick={() => navigate(`/owner/horses/${horse.id}`)}
          >
            Xem lịch sử đua
          </button>
        </div>
      )}
    </div>
  );
}
