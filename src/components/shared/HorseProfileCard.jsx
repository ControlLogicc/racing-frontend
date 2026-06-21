import { useNavigate } from 'react-router-dom';
import { Badge } from 'react-bootstrap';

function getRatingClass(rating) {
  if (rating >= 85) return 'Class 1';
  if (rating >= 80) return 'Class 2';
  if (rating >= 60) return 'Class 3';
  if (rating >= 40) return 'Class 4';
  return 'Class 5';
}

// Dùng ở owner (ngựa của tôi) và spectator (xem hồ sơ ngựa, read-only).
// showHistory: true → hiển thị nút "Lịch sử đua" (chỉ dành cho owner)
export default function HorseProfileCard({ horse, showHistory = false }) {
  const navigate = useNavigate();

  return (
    <div className="dash-card h-100 d-flex flex-column">
      <h5 style={{ color: '#D4AF37' }}>{horse.name}</h5>
      <p className="mb-1" style={{ color: '#b8ad94' }}>Tuổi: {horse.age}</p>
      <p className="mb-1" style={{ color: '#b8ad94' }}>Giống: {horse.breed}</p>
      <p className="mb-1" style={{ color: '#b8ad94' }}>Chủ sở hữu: {horse.ownerName}</p>
      {horse.rating != null && (
        <div className="d-flex align-items-center gap-2 mt-1">
          <span style={{ color: '#b8ad94', fontSize: 13 }}>Rating: <strong style={{ color: '#D4AF37' }}>{horse.rating}</strong></span>
          <Badge bg="warning" text="dark" style={{ fontSize: 11 }}>{getRatingClass(horse.rating)}</Badge>
        </div>
      )}
      {showHistory && (
        <button
          className="btn-gold-sm mt-auto"
          style={{ marginTop: 16, padding: '6px 0', width: '100%' }}
          onClick={() => navigate(`/owner/horses/${horse.id}`)}
        >
          📊 Xem lịch sử đua
        </button>
      )}
    </div>
  );
}
