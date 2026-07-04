import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { newsService } from '../../services/newsService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import './public-theme.css';

const PAGE_SIZE = 9;

export default function NewsPage() {
  const [items, setItems] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1); // 1-indexed cho Pagination component
  const [detailItem, setDetailItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    newsService.getPublished(page - 1, PAGE_SIZE)
      .then((res) => { setItems(res.items); setTotalElements(res.totalElements); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được tin tức.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const openDetail = (item) => {
    setDetailItem(item);
    setDetailLoading(true);
    newsService.getPublishedById(item.id)
      .then(setDetailItem)
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  };

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

          {loading && <Loading />}
          {!loading && error && <ErrorState message={error} onRetry={load} />}
          {!loading && !error && items.length === 0 && (
            <div className="pub-empty">
              <div className="pub-empty-icon">📭</div>
              <h5>Chưa có tin tức nào</h5>
              <p>Quay lại sau để xem cập nhật mới nhất.</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <>
              <div className="row g-4">
                {items.map((item) => (
                  <div className="col-12 col-md-6 col-lg-4" key={item.id}>
                    <div className="pub-news-card" style={{ cursor: 'pointer' }} onClick={() => openDetail(item)}>
                      <div className="pub-news-thumb" style={{ overflow: 'hidden', padding: item.thumbnailUrl ? 0 : undefined }}>
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = ''; }}
                          />
                        ) : null}
                        <span style={{ display: item.thumbnailUrl ? 'none' : '' }}>📰</span>
                      </div>
                      <div className="pub-news-body">
                        <div className="pub-news-meta">
                          <span className="pub-news-date">{formatDate(item.publishDate)}</span>
                        </div>
                        <h5>{item.title}</h5>
                        <p>{item.summary}</p>
                        <div className="pub-news-read">
                          <span>Xem thêm</span>
                          <span>→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination page={page} pageSize={PAGE_SIZE} total={totalElements} onPageChange={setPage} />
            </>
          )}
        </div>
      </section>

      {/* Modal chi tiết tin tức */}
      <Modal show={!!detailItem} onHide={() => setDetailItem(null)} centered size="lg">
        <Modal.Header closeButton style={{ background: '#1a1510', borderColor: 'rgba(212,175,55,0.2)' }}>
          <Modal.Title style={{ color: '#D4AF37', fontWeight: 800 }}>{detailItem?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#110f0a', color: '#c8bea0', padding: '1.5rem' }}>
          {detailLoading ? (
            <Loading />
          ) : detailItem ? (
            <div>
              {detailItem.thumbnailUrl && (
                <img
                  src={detailItem.thumbnailUrl}
                  alt={detailItem.title}
                  style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div style={{ fontSize: 12, color: '#8a8065', marginBottom: 12 }}>{formatDate(detailItem.publishDate)}</div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{detailItem.content || detailItem.summary}</div>
              {detailItem.externalLink && (
                <a href={detailItem.externalLink} target="_blank" rel="noopener noreferrer" className="d-inline-block mt-3" style={{ color: '#D4AF37' }}>
                  Xem thêm liên kết ngoài →
                </a>
              )}
            </div>
          ) : null}
        </Modal.Body>
      </Modal>
    </div>
  );
}
