import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import './spectator-theme.css';

export default function SpectatorResultsListPage() {
  const navigate = useNavigate();
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    raceService.getPublic()
      .then((data) => {
        const finished = (data || []).filter((r) => ['OFFICIAL', 'RESULT_PENDING'].includes(r.status));
        setRaces(finished);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách kết quả.')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="spectator-container">
      <div className="spectator-hero mb-4">
        <h2 style={{ color: '#D4AF37', fontWeight: 800 }}>🏆 Kết quả đua</h2>
        <p style={{ color: '#8a7a60', margin: 0 }}>Danh sách các cuộc đua đã có kết quả chính thức</p>
      </div>

      {races.length === 0 ? (
        <EmptyState message="Chưa có cuộc đua nào có kết quả." />
      ) : (
        <div className="spectator-card">
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                  {['Tên race', 'Meeting', 'Giờ đua', 'Trạng thái', ''].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 11, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {races.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                    onClick={() => navigate(`/spectator/results/${r.id}`)}>
                    <td style={{ padding: '12px 14px', color: '#f0e8d0', fontWeight: 700 }}>🏁 {r.name}</td>
                    <td style={{ padding: '12px 14px', color: '#8a7a60' }}>{r.meetingName || '—'}</td>
                    <td style={{ padding: '12px 14px', color: '#8a7a60', whiteSpace: 'nowrap' }}>{formatDate(r.raceTime)}</td>
                    <td style={{ padding: '12px 14px' }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        className="btn-vip"
                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.9rem' }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/spectator/results/${r.id}`); }}
                      >
                        Xem kết quả →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
