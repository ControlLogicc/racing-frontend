// Dùng ở owner (ngựa của tôi) và spectator (xem hồ sơ ngựa, read-only).
export default function HorseProfileCard({ horse }) {
  return (
    <div className="dash-card h-100">
      <h5 style={{ color: '#D4AF37' }}>{horse.name}</h5>
      <p className="mb-1" style={{ color: '#b8ad94' }}>Tuổi: {horse.age}</p>
      <p className="mb-1" style={{ color: '#b8ad94' }}>Giống: {horse.breed}</p>
      <p className="mb-0" style={{ color: '#b8ad94' }}>Chủ sở hữu: {horse.ownerName}</p>
    </div>
  );
}
