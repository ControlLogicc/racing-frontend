import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './public-theme.css';

const FEATURES = [
  { id: 'f1', icon: '🏁', title: 'Race Schedule', desc: 'Theo dõi lịch đua mới nhất, cập nhật theo từng mùa giải.' },
  { id: 'f2', icon: '🏆', title: 'Rankings', desc: 'Bảng xếp hạng ngựa và nài ngựa theo kết quả thi đấu.' },
  { id: 'f3', icon: '🐎', title: 'Horse Profiles', desc: 'Thông tin chi tiết về ngựa đua, chủ sở hữu và lịch sử thi đấu.' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="pub-page">
      <section className="pub-hero">
        <h1>FPT Horse Racing</h1>
        <p>Hệ thống quản lý và theo dõi đua ngựa chuyên nghiệp — lịch đua, xếp hạng và hồ sơ ngựa.</p>
        {!user && (
          <div className="pub-hero-actions">
            <Link to="/register" className="pub-btn-gold">Đăng ký ngay</Link>
            <Link to="/login" className="pub-btn-outline">Đăng nhập</Link>
          </div>
        )}
      </section>

      <section className="container">
        <div className="pub-section-title-wrap">
          <h2 className="pub-section-title">Khám phá</h2>
        </div>
        <div className="row g-4">
          {FEATURES.map((f) => (
            <div className="col-12 col-sm-6 col-lg-3" key={f.id}>
              <div className="pub-card">
                <div className="pub-card-icon">{f.icon}</div>
                <h5>{f.title}</h5>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
