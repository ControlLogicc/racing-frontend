import { useEffect, useState, useMemo } from 'react';
import { horseService } from '../../services/horseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import './spectator-theme.css';

const CLASS_COLORS = { 1: '#fbbf24', 2: '#34d399', 3: '#60a5fa', 4: '#a78bfa', 5: '#94a3b8' };

const VIPHorseCard = ({ horse }) => {
  const cls = horse.horseClass || horse.class;
  return (
    <div className="vip-panel h-100 d-flex flex-column" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ height: 110, background: 'linear-gradient(135deg, rgba(6,78,59,0.4), rgba(2,6,23,0.9))', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(251,191,36,0.15)' }}>
        <div style={{ width: 70, height: 70, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
          🐎
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex-grow-1">
        <h5 style={{ fontFamily: "'Playfair Display', serif", color: '#fbbf24', marginBottom: 2 }}>{horse.name || horse.horseName}</h5>
        <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          {horse.ownerName || horse.ownerEmail || 'Owner N/A'}
        </div>

        {[
          { label: 'Tuổi', value: horse.age ? `${horse.age} tuổi` : '—' },
          { label: 'Giới tính', value: horse.gender === 'M' ? '♂ Đực' : horse.gender === 'F' ? '♀ Cái' : horse.gender || '—' },
          { label: 'Màu lông', value: horse.color || '—' },
          { label: 'Rating', value: horse.currentScore != null ? Number(horse.currentScore).toFixed(1) : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="d-flex justify-content-between mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>{label}</span>
            <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(2,6,23,0.5)', borderTop: '1px solid rgba(6,78,59,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={`vip-badge ${horse.status === 'active' || horse.status === 'ACTIVE' ? 'vip-badge-emerald' : 'vip-badge-gold'}`}>
          {String(horse.status || '—').toUpperCase()}
        </span>
        {cls && (
          <span style={{ fontSize: 13, fontWeight: 700, color: CLASS_COLORS[cls] || '#94a3b8' }}>
            Class {cls}
          </span>
        )}
      </div>
    </div>
  );
};

export default function SpectatorHorsesPage() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const load = () => {
    horseService.getPublicAll()
      .then(setHorses)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được hồ sơ ngựa.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => horses.filter((h) => {
    const name = (h.name || h.horseName || '').toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const cls = h.horseClass || h.class;
    const matchClass = !filterClass || String(cls) === filterClass;
    return matchSearch && matchClass;
  }), [horses, search, filterClass]);

  return (
    <div className="spectator-context">
      <div className="spec-hero">
        <h2>BỘ SƯU TẬP CHIẾN MÃ</h2>
        <p>KHÁM PHÁ HỒ SƠ VÀ THÔNG SỐ CỦA NHỮNG NGÔI SAO TRÊN ĐƯỜNG ĐUA</p>
      </div>

      {/* Filter bar */}
      {!loading && !error && horses.length > 0 && (
        <div className="vip-panel mb-4">
          <div className="d-flex gap-3 flex-wrap align-items-center">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm tên ngựa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 260, background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 6 }}
            />
            <select
              className="form-select"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              style={{ maxWidth: 160, background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 6 }}
            >
              <option value="">Tất cả Class</option>
              {[1, 2, 3, 4, 5].map((c) => <option key={c} value={c}>Class {c}</option>)}
            </select>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>{filtered.length} ngựa</span>
          </div>
        </div>
      )}

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={() => { setLoading(true); setError(''); load(); }} />}
      {!loading && !error && filtered.length === 0 && <EmptyState message="Không tìm thấy ngựa nào." />}

      {!loading && !error && filtered.length > 0 && (
        <div className="row g-4">
          {filtered.map((h) => (
            <div className="col-12 col-md-6 col-xl-4" key={h.id}>
              <VIPHorseCard horse={h} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
