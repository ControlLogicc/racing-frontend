import { useState } from 'react';
import './public-theme.css';

const CATEGORIES = ['Tất cả', 'Kết quả đua', 'Thông báo', 'Ngựa & Jockey', 'Sự kiện'];

const NEWS_ITEMS = [
  {
    id: 1, cat: 'Kết quả đua', emoji: '🏆',
    title: 'Thần Mã vô địch Saigon Cup — chiến thắng với cách biệt 3 thân ngựa',
    summary: 'Ngựa Thần Mã đã có màn trình diễn xuất sắc tại Race #9 mùa giải Spring 2026, về nhất ấn tượng trên cự ly 2000m.',
    date: '20/06/2026', read: '2 phút đọc',
  },
  {
    id: 2, cat: 'Thông báo', emoji: '📢',
    title: 'Mở đăng ký mùa giải Summer 2026 — Hạn chót 30/07/2026',
    summary: 'Ban tổ chức chính thức mở đăng ký cho mùa giải Summer 2026 với 12 cuộc đua trên 3 cự ly khác nhau.',
    date: '18/06/2026', read: '3 phút đọc',
  },
  {
    id: 3, cat: 'Ngựa & Jockey', emoji: '🐎',
    title: 'Top 5 ngựa đua đáng chú ý nhất mùa giải Spring 2026',
    summary: 'Cùng điểm qua những chú ngựa đã ghi dấu ấn mạnh mẽ — thành tích, chỉ số và tiềm năng cho mùa tới.',
    date: '15/06/2026', read: '5 phút đọc',
  },
  {
    id: 4, cat: 'Sự kiện', emoji: '🗓️',
    title: 'Grand Prix FPT 2026 — Sự kiện đua ngựa lớn nhất năm sắp diễn ra',
    summary: 'FPT Racing công bố lịch tổ chức Grand Prix thường niên vào tháng 9/2026 với tổng giải thưởng kỷ lục.',
    date: '10/06/2026', read: '4 phút đọc',
  },
  {
    id: 5, cat: 'Kết quả đua', emoji: '🥈',
    title: 'Kết quả đầy đủ Race Meeting #4 — Phi Long lần đầu vào top 3',
    summary: 'Race Meeting #4 kết thúc với nhiều bất ngờ. Phi Long lần đầu lọt top 3 sau 8 lần thi đấu.',
    date: '05/06/2026', read: '3 phút đọc',
  },
  {
    id: 6, cat: 'Thông báo', emoji: '⚙️',
    title: 'Cập nhật hệ thống v2.4 — Cải thiện tốc độ và giao diện quản lý',
    summary: 'Hệ thống FPT Racing v2.4 với nhiều cải tiến về hiệu suất, dashboard và tính năng xuất báo cáo.',
    date: '01/06/2026', read: '2 phút đọc',
  },
];

export default function NewsPage() {
  const [active, setActive] = useState('Tất cả');

  const filtered = active === 'Tất cả'
    ? NEWS_ITEMS
    : NEWS_ITEMS.filter((n) => n.cat === active);

  return (
    <div className="pub-page">
      <section className="pub-section">
        <div className="container">
          <div className="pub-section-label">
            <span className="pub-section-badge">Tin tức</span>
          </div>
          <h2 className="pub-section-title">Tin tức & Cập nhật</h2>
          <p className="pub-section-sub">
            Kết quả đua, thông báo sự kiện và tin tức mới nhất từ FPT Racing.
          </p>

          <div className="pub-filter-bar">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`pub-filter-btn${active === c ? ' active' : ''}`}
                onClick={() => setActive(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="pub-empty">
              <div className="pub-empty-icon">📭</div>
              <h5>Không có bài viết nào</h5>
              <p>Chưa có tin tức trong danh mục này.</p>
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map((item) => (
                <div className="col-12 col-md-6 col-lg-4" key={item.id}>
                  <div className="pub-news-card">
                    <div className="pub-news-thumb">{item.emoji}</div>
                    <div className="pub-news-body">
                      <div className="pub-news-meta">
                        <span className="pub-news-cat">{item.cat}</span>
                        <span className="pub-news-date">{item.date}</span>
                      </div>
                      <h5>{item.title}</h5>
                      <p>{item.summary}</p>
                      <div className="pub-news-read">
                        <span>{item.read}</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
