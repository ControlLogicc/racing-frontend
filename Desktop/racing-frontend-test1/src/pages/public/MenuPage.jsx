import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HOME_ROUTE_BY_ROLE } from '../../constants/roles';
import './public-theme.css';

const PUBLIC_NAV = [
  { to: '/', icon: '🏠', title: 'Trang chủ', desc: 'Về trang chủ FPT Horse Racing' },
  { to: '/schedule', icon: '🗓️', title: 'Lịch đua', desc: 'Xem toàn bộ lịch đua sắp tới theo mùa giải' },
  { to: '/ranking', icon: '🏆', title: 'Bảng xếp hạng', desc: 'Xếp hạng ngựa và jockey theo mùa giải' },
  { to: '/horses', icon: '🐎', title: 'Hồ sơ ngựa', desc: 'Chi tiết ngựa đua — chủ sở hữu và thành tích' },
  { to: '/news', icon: '📰', title: 'Tin tức', desc: 'Kết quả đua và cập nhật mới nhất từ hệ thống' },
];

const AUTH_NAV = [
  { to: '/login', icon: '🔑', title: 'Đăng nhập', desc: 'Truy cập tài khoản của bạn' },
  { to: '/register', icon: '✍️', title: 'Đăng ký', desc: 'Tạo tài khoản chủ ngựa, jockey hoặc admin' },
];

export default function MenuPage() {
  const { user } = useAuth();
  const dashRoute = user ? HOME_ROUTE_BY_ROLE[user.role] || '/' : null;

  return (
    <div className="pub-page">
      <section className="pub-section">
        <div className="container" style={{ maxWidth: 860 }}>
          {/* heading */}
          <div className="pub-section-label">
            <span className="pub-section-badge">Điều hướng</span>
          </div>
          <h2 className="pub-section-title">Menu</h2>
          <p className="pub-section-sub">
            Tất cả chức năng của FPT Horse Racing trong một trang.
          </p>

          {/* public pages */}
          <div className="pub-nav-section-title">Trang công khai</div>
          <div className="d-flex flex-column gap-3 mb-5">
            {PUBLIC_NAV.map((item) => (
              <Link key={item.to} to={item.to} className="pub-menu-card">
                <div className="pub-menu-card-icon">{item.icon}</div>
                <div className="pub-menu-card-text">
                  <div className="pub-menu-card-title">{item.title}</div>
                  <div className="pub-menu-card-desc">{item.desc}</div>
                </div>
                <div className="pub-menu-card-arrow">›</div>
              </Link>
            ))}
          </div>

          {/* dashboard shortcut if logged in */}
          {user && dashRoute && (
            <>
              <div className="pub-nav-section-title">Dashboard</div>
              <div className="d-flex flex-column gap-3 mb-5">
                <Link to={dashRoute} className="pub-menu-card">
                  <div className="pub-menu-card-icon">⚡</div>
                  <div className="pub-menu-card-text">
                    <div className="pub-menu-card-title">Vào Dashboard của bạn</div>
                    <div className="pub-menu-card-desc">Quản lý ngựa, đăng ký race và theo dõi tiến trình</div>
                  </div>
                  <div className="pub-menu-card-arrow">›</div>
                </Link>
              </div>
            </>
          )}

          {/* auth */}
          {!user && (
            <>
              <div className="pub-nav-section-title">Tài khoản</div>
              <div className="d-flex flex-column gap-3">
                {AUTH_NAV.map((item) => (
                  <Link key={item.to} to={item.to} className="pub-menu-card">
                    <div className="pub-menu-card-icon">{item.icon}</div>
                    <div className="pub-menu-card-text">
                      <div className="pub-menu-card-title">{item.title}</div>
                      <div className="pub-menu-card-desc">{item.desc}</div>
                    </div>
                    <div className="pub-menu-card-arrow">›</div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
