// src/pages/errors/NotFoundPage.jsx
import { Link } from 'react-router-dom';

const GOLD = '#D4AF37';

export default function NotFoundPage() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-center"
      style={{ minHeight: '100vh', backgroundColor: '#0f0f11', color: '#f5f5f5' }}>
      <h1 className="display-1 fw-bold" style={{ color: GOLD }}>404</h1>
      <h3 className="mb-3">Không tìm thấy trang</h3>
      <Link to="/" className="btn fw-bold"
        style={{ border: `1px solid ${GOLD}`, color: GOLD, backgroundColor: 'transparent' }}>
        ← Về trang chủ
      </Link>
    </div>
  );
}