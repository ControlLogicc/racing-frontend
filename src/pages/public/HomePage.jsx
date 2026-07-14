import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar3,
  ChevronLeft,
  ChevronRight,
  FlagFill,
  Newspaper,
  PersonBadgeFill,
  TrophyFill,
} from 'react-bootstrap-icons';
import AmbientGoldParticles from '../../components/public/AmbientGoldParticles';
import { useAuth } from '../../hooks/useAuth';
import './home-theme.css';

const FEATURES = [
  {
    id: 'schedule',
    icon: Calendar3,
    eyebrow: 'Lịch thi đấu',
    title: 'Race Schedule',
    desc: 'Theo dõi lịch đua mới nhất theo từng mùa giải và những cuộc đua sắp diễn ra.',
    to: '/schedule',
  },
  {
    id: 'ranking',
    icon: TrophyFill,
    eyebrow: 'Thành tích',
    title: 'Rankings',
    desc: 'Bảng xếp hạng ngựa và nài ngựa được cập nhật từ kết quả thi đấu chính thức.',
    to: '/ranking',
  },
  {
    id: 'horses',
    icon: PersonBadgeFill,
    eyebrow: 'Chiến mã',
    title: 'Horse Profiles',
    desc: 'Khám phá hồ sơ ngựa đua, chủ sở hữu, lịch sử thi đấu và thành tích nổi bật.',
    to: '/horses',
  },
  {
    id: 'news',
    icon: Newspaper,
    eyebrow: 'Tin mới',
    title: 'News & Updates',
    desc: 'Tin tức, kết quả đua và những thông báo mới nhất từ hệ thống FPT Racing.',
    to: '/news',
  },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    title: 'Đăng ký tài khoản',
    desc: 'Tạo tài khoản chủ ngựa, jockey hoặc thành viên chỉ trong vài phút.',
  },
  {
    num: '02',
    title: 'Đăng ký ngựa & race',
    desc: 'Chủ ngựa đăng ký ngựa tham dự race và mời jockey phù hợp.',
  },
  {
    num: '03',
    title: 'Thi đấu & kết quả',
    desc: 'Kết quả được xác nhận và tự động cập nhật vào bảng xếp hạng.',
  },
];

const STATS = [
  { value: '50+', label: 'Cuộc đua' },
  { value: '120+', label: 'Ngựa đua' },
  { value: '40+', label: 'Jockey' },
  { value: '6', label: 'Mùa giải' },
];

function getCardPosition(index, activeIndex) {
  const offset = (index - activeIndex + FEATURES.length) % FEATURES.length;
  if (offset === 0) return 'center';
  if (offset === 1) return 'right';
  if (offset === FEATURES.length - 1) return 'left';
  return 'hidden';
}

export default function HomePage() {
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);

  const showPrevious = () => {
    setActiveFeature((current) => (current - 1 + FEATURES.length) % FEATURES.length);
  };

  const showNext = () => {
    setActiveFeature((current) => (current + 1) % FEATURES.length);
  };

  const focusCard = (index, position) => {
    if (position === 'left' || position === 'right') setActiveFeature(index);
  };

  const handleCardKeyDown = (event, index, position) => {
    if ((event.key === 'Enter' || event.key === ' ') && position !== 'hidden') {
      event.preventDefault();
      focusCard(index, position);
    }
  };

  return (
    <div className="home3d-page">
      <AmbientGoldParticles excludeSelector="#features" />

      <section className="home3d-hero">
        <div className="home3d-grid" aria-hidden="true" />
        <div className="home3d-hero-content">
          <div className="home3d-kicker"><FlagFill /> FPT Horse Racing System</div>
          <h1>
            <span className="home3d-title-line">The ultimate racing</span>
            <span className="home3d-title-accent">Experience</span>
          </h1>
          <p>
            Nơi hội tụ của những huyền thoại đường đua. Trải nghiệm cảm giác nghẹt thở,
            đẳng cấp và minh bạch tuyệt đối trên nền tảng thể thao quý tộc.
          </p>

          <div className="home3d-hero-actions">
            {!user ? (
              <>
                <Link to="/register" className="home3d-btn home3d-btn-primary">Bắt đầu ngay <ArrowRight /></Link>
                <Link to="/login" className="home3d-btn home3d-btn-outline">Đăng nhập</Link>
              </>
            ) : (
              <>
                <Link to="/schedule" className="home3d-btn home3d-btn-primary">Xem lịch đua <ArrowRight /></Link>
                <Link to="/horses" className="home3d-btn home3d-btn-outline">Khám phá chiến mã</Link>
              </>
            )}
          </div>

          <div className="home3d-stats" aria-label="Thống kê hệ thống">
            {STATS.map((stat) => (
              <div className="home3d-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <a className="home3d-scroll" href="#features">Khám phá <span>↓</span></a>
      </section>

      <section className="home3d-section home3d-features" id="features">
        <div className="home3d-section-heading">
          <span>Đặc quyền</span>
          <h2>Khám phá nền tảng</h2>
          <p>Từ lịch đua đến kết quả, mọi thứ đều trong tầm tay bạn.</p>
        </div>

        <div className="home3d-carousel" aria-roledescription="carousel" aria-label="Tính năng nổi bật">
          <div className="home3d-carousel-stage" aria-live="polite">
            {FEATURES.map((feature, index) => {
              const position = getCardPosition(index, activeFeature);
              const Icon = feature.icon;

              return (
                <article
                  key={feature.id}
                  className={`home3d-feature-card is-${position}`}
                  aria-hidden={position === 'hidden'}
                  tabIndex={position === 'hidden' ? -1 : 0}
                  onClick={() => focusCard(index, position)}
                  onKeyDown={(event) => handleCardKeyDown(event, index, position)}
                >
                  <div className="home3d-feature-icon"><Icon /></div>
                  <span className="home3d-feature-eyebrow">{feature.eyebrow}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                  <Link
                    to={feature.to}
                    className="home3d-feature-link"
                    tabIndex={position === 'center' ? 0 : -1}
                  >
                    Xem ngay <ArrowRight />
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="home3d-carousel-controls">
            <button type="button" onClick={showPrevious} aria-label="Tính năng trước"><ChevronLeft /></button>
            <div className="home3d-dots" aria-label={`Tính năng ${activeFeature + 1} trên ${FEATURES.length}`}>
              {FEATURES.map((feature, index) => (
                <button
                  type="button"
                  key={feature.id}
                  className={index === activeFeature ? 'active' : ''}
                  onClick={() => setActiveFeature(index)}
                  aria-label={`Xem ${feature.title}`}
                  aria-current={index === activeFeature ? 'true' : undefined}
                />
              ))}
            </div>
            <button type="button" onClick={showNext} aria-label="Tính năng tiếp theo"><ChevronRight /></button>
          </div>
        </div>
      </section>

      <div className="home3d-story">
        <section className="home3d-section home3d-process">
          <div className="home3d-section-heading">
            <span>Quy trình</span>
            <h2>Cách hoạt động</h2>
            <p>Đơn giản, minh bạch từ đăng ký đến khi công bố kết quả.</p>
          </div>

          <div className="home3d-process-list">
            {HOW_IT_WORKS.map((step) => (
              <article className="home3d-process-step" key={step.num}>
                <div className="home3d-step-number">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {!user && (
          <section className="home3d-cta">
            <div className="home3d-cta-content">
              <span>Đường đua đang chờ</span>
              <h2>Sẵn sàng tham gia?</h2>
              <p>Tạo tài khoản miễn phí và trải nghiệm hệ thống quản lý đua ngựa chuyên nghiệp ngay hôm nay.</p>
              <div className="home3d-hero-actions">
                <Link to="/register" className="home3d-btn home3d-btn-primary">Trở thành hội viên</Link>
                <Link to="/schedule" className="home3d-btn home3d-btn-outline">Xem lịch đua</Link>
              </div>
            </div>
          </section>
        )}
      </div>

      <footer className="home3d-footer">
        <div>
          <strong><FlagFill /> FPT Racing</strong>
          <p>Precision. Performance. Prestige.</p>
        </div>
      </footer>
    </div>
  );
}
