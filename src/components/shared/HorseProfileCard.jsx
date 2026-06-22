import { useNavigate } from 'react-router-dom';
import '../../pages/owner/owner-theme.css';

function getClassLabel(rating) {
  if (rating >= 85) return { label: 'Class 1', css: 'horse-class-1' };
  if (rating >= 80) return { label: 'Class 2', css: 'horse-class-2' };
  if (rating >= 60) return { label: 'Class 3', css: 'horse-class-3' };
  if (rating >= 40) return { label: 'Class 4', css: 'horse-class-other' };
  return { label: 'Class 5', css: 'horse-class-other' };
}

export default function HorseProfileCard({ horse, showHistory = false }) {
  const navigate = useNavigate();
  const cls = horse.rating != null ? getClassLabel(horse.rating) : null;
  const ratingPct = horse.rating != null ? Math.min(100, horse.rating) : null;

  return (
    <div className="horse-card">
      {/* Header */}
      <div className="horse-card-header">
        <div className="d-flex align-items-center gap-3">
          <div className="horse-card-avatar">🐎</div>
          <div className="flex-grow-1 min-width-0">
            <div className="horse-card-name">{horse.name}</div>
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
          <span className="horse-stat-value">{horse.breed}</span>
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
