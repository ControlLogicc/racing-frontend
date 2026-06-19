import { Link } from 'react-router-dom';
import './public-theme.css';

const MENU_LINKS = [
  { id: 'm1', to: '/', icon: '🏠', title: 'Home', desc: 'Trang chủ FPT Horse Racing' },
  { id: 'm2', to: '/news', icon: '📰', title: 'News', desc: 'Tin tức mới nhất' },
  { id: 'm4', to: '/schedule', icon: '🗓️', title: 'Race Schedule', desc: 'Lịch đua sắp tới' },
  { id: 'm5', to: '/ranking', icon: '🏆', title: 'Rankings', desc: 'Bảng xếp hạng' },
  { id: 'm6', to: '/horses', icon: '🐎', title: 'Horse Profiles', desc: 'Hồ sơ ngựa đua' },
];

export default function MenuPage() {
  return (
    <div className="pub-page">
      <section className="container pt-5">
        <div className="pub-section-title-wrap">
          <h2 className="pub-section-title">Menu</h2>
        </div>

        <div className="row g-4">
          {MENU_LINKS.map((item) => (
            <div className="col-12 col-sm-6 col-lg-4" key={item.id}>
              <Link to={item.to} className="pub-menu-link">
                <div className="pub-card">
                  <div className="pub-card-icon">{item.icon}</div>
                  <h5>{item.title}</h5>
                  <p>{item.desc}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
