// src/pages/common/PlaceholderPage.jsx
// Trang tạm cho các mục menu con (Users, Seasons, Registrations...) chưa được
// xây dựng ở task này. Giúp link sidebar không bị 404. KHÔNG chứa logic CRUD.
const GOLD = '#D4AF37';

export default function PlaceholderPage({ title = 'Coming soon' }) {
  return (
    <div>
      <h2 className="mb-3" style={{ color: GOLD }}>{title}</h2>
      <div className="card shadow-sm"
        style={{ backgroundColor: '#1a1a1a', color: '#f5f5f5', border: '1px solid #333' }}>
        <div className="card-body">
          <p className="mb-1">🚧 Màn hình này sẽ được phát triển ở task tiếp theo.</p>
          <small className="text-muted">
            Task hiện tại chỉ tập trung layout dashboard + sidebar + header.
          </small>
        </div>
      </div>
    </div>
  );
}