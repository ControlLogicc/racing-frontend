import './public-theme.css';

// TODO: thay bằng dữ liệu thật khi có API tin tức.
const NEWS_ITEMS = [];

export default function NewsPage() {
  return (
    <div className="pub-page">
      <section className="container pt-5">
        <div className="pub-section-title-wrap">
          <h2 className="pub-section-title">Tin tức</h2>
        </div>

        {NEWS_ITEMS.length === 0 ? (
          <div className="pub-empty">Chưa có tin tức nào. Vui lòng quay lại sau.</div>
        ) : (
          <div className="row g-4">
            {NEWS_ITEMS.map((item) => (
              <div className="col-12 col-md-6 col-lg-4" key={item.id}>
                <div className="pub-card">
                  <h5>{item.title}</h5>
                  <p>{item.summary}</p>
                  <span className="pub-card-time">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
