import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './public-theme.css';

const FEATURES = [
  {
    id: 'f1', icon: '🏁', title: 'Race Schedule',
    desc: 'Theo dõi lịch đua mới nhất theo từng mùa giải và cuộc đua sắp diễn ra.',
    to: '/schedule',
  },
  {
    id: 'f2', icon: '🏆', title: 'Rankings',
    desc: 'Bảng xếp hạng ngựa và nài ngựa được cập nhật theo kết quả thi đấu thực tế.',
    to: '/ranking',
  },
  {
    id: 'f3', icon: '🐎', title: 'Horse Profiles',
    desc: 'Hồ sơ chi tiết ngựa đua — chủ sở hữu, lịch sử thi đấu và thành tích.',
    to: '/horses',
  },
  {
    id: 'f4', icon: '📰', title: 'News & Updates',
    desc: 'Tin tức, kết quả đua và thông báo mới nhất từ hệ thống FPT Racing.',
    to: '/news',
  },
];

const HOW_IT_WORKS = [
  { num: '01', title: 'Đăng ký tài khoản', desc: 'Tạo tài khoản chủ ngựa, jockey hoặc quản trị viên trong vài phút.' },
  { num: '02', title: 'Đăng ký ngựa & race', desc: 'Chủ ngựa đăng ký ngựa tham dự race, mời jockey phù hợp.' },
  { num: '03', title: 'Thi đấu & kết quả', desc: 'Referee xác nhận kết quả, hệ thống tự động cập nhật bảng xếp hạng.' },
];

const STATS = [
  { value: '50+', label: 'Cuộc đua' },
  { value: '120+', label: 'Ngựa đua' },
  { value: '40+', label: 'Jockey' },
  { value: '6', label: 'Mùa giải' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="pub-page">
      {/* ── HERO ─────────────────────────────────── */}
      <section className="pub-hero">
        <div className="vip-particles">
          <div className="particle p1"></div>
          <div className="particle p2"></div>
          <div className="particle p3"></div>
          <div className="particle p4"></div>
          <div className="particle p5"></div>
        </div>

        <div className="pub-hero-inner">
          <div className="pub-hero-badge vip-glow">FPT Horse Racing System</div>

          <h1 className="pub-hero-title vip-shimmer">
            <span>THE ULTIMATE</span>
            <span>RACING</span>
            <span>EXPERIENCE</span>
          </h1>

          <p className="pub-hero-sub">
            Nơi hội tụ của những huyền thoại đường đua. Trải nghiệm cảm giác nghẹt thở,
            đẳng cấp và minh bạch tuyệt đối trên nền tảng thể thao quý tộc.
          </p>

          {!user ? (
            <div className="pub-hero-actions">
              <Link to="/register" className="pub-btn-gold vip-btn-effect">BẮT ĐẦU NGAY</Link>
              <Link to="/login" className="pub-btn-outline vip-btn-effect">ĐĂNG NHẬP</Link>
            </div>
          ) : (
            <div className="pub-hero-actions">
              <Link to="/schedule" className="pub-btn-gold vip-btn-effect">LỊCH ĐUA VIP</Link>
              <Link to="/horses" className="pub-btn-outline vip-btn-effect">CHIẾN MÃ</Link>
            </div>
          )}

          <div className="pub-hero-stats vip-glass">
            {STATS.map((s) => (
              <div className="pub-hero-stat" key={s.label}>
                <div className="pub-stat-value">{s.value}</div>
                <div className="pub-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pub-scroll-hint">Khám phá</div>
      </section>

      {/* ── FEATURES ─────────────────────────────── */}
      <section className="pub-section">
        <div className="container">
          <div className="pub-section-label">
            <span className="pub-section-badge">ĐẶC QUYỀN</span>
          </div>
          <h2 className="pub-section-title">Khám phá nền tảng</h2>
          <p className="pub-section-sub">
            Từ lịch đua đến kết quả, mọi thứ đều trong tầm tay bạn.
          </p>

          <div className="row g-4">
            {FEATURES.map((f) => (
              <div className="col-12 col-sm-6 col-lg-3" key={f.id}>
                <div className="pub-feature-card vip-hover">
                  <div className="pub-feature-icon">{f.icon}</div>
                  <h5>{f.title}</h5>
                  <p>{f.desc}</p>
                  <Link to={f.to} className="pub-feature-link">
                    Xem ngay →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="pub-divider" />

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section className="pub-section">
        <div className="container">
          <div className="pub-section-label">
            <span className="pub-section-badge">QUY TRÌNH</span>
          </div>
          <h2 className="pub-section-title">Cách hoạt động</h2>
          <p className="pub-section-sub">
            Hệ thống đơn giản, minh bạch từ đăng ký đến công bố kết quả.
          </p>

          <div className="d-flex align-items-start justify-content-center flex-wrap">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.num} className="d-flex align-items-start">
                <div className="pub-step">
                  <div className="pub-step-num">{step.num}</div>
                  <h6>{step.title}</h6>
                  <p>{step.desc}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="pub-step-connector" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      {!user && (
        <section className="pub-cta">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2>Sẵn sàng tham gia?</h2>
            <p>
              Tạo tài khoản miễn phí và trải nghiệm hệ thống quản lý đua ngựa
              chuyên nghiệp ngay hôm nay.
            </p>
            <div className="pub-hero-actions">
              <Link to="/register" className="pub-btn-gold vip-btn-effect">TRỞ THÀNH HỘI VIÊN</Link>
              <Link to="/schedule" className="pub-btn-outline vip-btn-effect">XEM LỊCH ĐUA</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
