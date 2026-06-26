import { useEffect, useState } from 'react';
import { horseService } from '../../services/horseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import './spectator-theme.css';

const VIPHorseCard = ({ horse }) => {
  return (
    <div className="vip-panel h-100 d-flex flex-column" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
      {/* Background Glow */}
      <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
      
      {/* Header Image area */}
      <div style={{ height: 140, background: 'linear-gradient(135deg, rgba(6,78,59,0.4), rgba(2,6,23,0.9))', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(251,191,36,0.2)' }}>
        <div style={{ width: 80, height: 80, background: 'rgba(251,191,36,0.1)', border: '1px solid #fbbf24', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', boxShadow: '0 0 20px rgba(251,191,36,0.2)' }}>
          🐎
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-grow-1">
        <h4 style={{ fontFamily: "'Playfair Display', serif", color: '#fbbf24', fontSize: '1.4rem', marginBottom: '0.2rem' }}>{horse.name}</h4>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.2rem' }}>
          Owner: {horse.ownerId || 'N/A'}
        </div>

        <div className="d-flex justify-content-between mb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Age</span>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{horse.age} yrs</span>
        </div>
        <div className="d-flex justify-content-between mb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Color</span>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{horse.color}</span>
        </div>
        <div className="d-flex justify-content-between mb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Weight</span>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{horse.weight} kg</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem 1.5rem', background: 'rgba(2,6,23,0.5)', borderTop: '1px solid rgba(6,78,59,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="vip-badge vip-badge-emerald">{horse.status}</span>
        <span style={{ fontFamily: "'Playfair Display', serif", color: '#fbbf24', fontSize: '1.2rem', fontStyle: 'italic' }}>Elite</span>
      </div>
    </div>
  );
};

export default function SpectatorHorsesPage() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    horseService
      .getPublicAll()
      .then(setHorses)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được hồ sơ ngựa.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const refetch = () => {
    setLoading(true);
    setError('');
    load();
  };

  return (
    <div className="spectator-context">
      <div className="spec-hero">
        <h2>BỘ SƯU TẬP CHIẾN MÃ</h2>
        <p>KHÁM PHÁ HỒ SƠ VÀ THÔNG SỐ CỦA NHỮNG NGÔI SAO TRÊN ĐƯỜNG ĐUA</p>
      </div>

      <div className="container-fluid px-0">
        {loading && <Loading />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && horses.length === 0 && <EmptyState message="Chưa có ngựa nào." />}
        
        {!loading && !error && horses.length > 0 && (
          <div className="row g-4">
            {horses.map((h) => (
              <div className="col-12 col-md-6 col-xl-4" key={h.id}>
                <VIPHorseCard horse={h} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
