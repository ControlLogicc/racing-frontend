import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resultService } from '../../services/resultService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Modal } from 'react-bootstrap';
import JockeyHistoryPanel from '../../components/jockey/JockeyHistoryPanel';
import './spectator-theme.css';

function exportCSV(race, results) {
  const sorted = [...results].sort((a, b) => Number(a.position) - Number(b.position));
  const header = ['Vị trí', 'Ngựa', 'Jockey', 'Thời gian', 'Giải thưởng (VND)'];
  const rows = sorted.map((r) => [
    r.position,
    r.horseName,
    r.jockeyName,
    r.finishTime,
    formatCurrency(r.prize),
  ]);
  const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ket-qua-${race?.name ?? 'race'}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export default function SpectatorRaceResultPage() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJockeyId, setSelectedJockeyId] = useState(null);

  const numericId = Number(raceId);

  const load = () => {
    Promise.all([
      resultService.getByRace(numericId),
      raceService.getPublicById(numericId),
    ])
      .then(([res, r]) => { setResults(res); setRace(r); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được kết quả.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!raceId || isNaN(numericId)) {
      navigate('/not-found', { replace: true });
      return;
    }
    load();
  }, [raceId]);

  const refetch = () => { setLoading(true); setError(''); load(); };

  return (
    <div className="spectator-context">
      <div className="spec-hero" style={{ padding: '2rem 3rem' }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <button className="btn-vip" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }} onClick={() => navigate(-1)}>
            ← TRỞ LẠI
          </button>
          {!loading && !error && results.length > 0 && (
            <button className="btn-vip" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }} onClick={() => exportCSV(race, results)}>
              XUẤT BẢNG KẾT QUẢ
            </button>
          )}
        </div>
        <h2 style={{ fontSize: '2.2rem' }}>KẾT QUẢ {race ? `— ${race.name.toUpperCase()}` : ''}</h2>
        <p>BẢNG VÀNG THÀNH TÍCH CỦA NHỮNG NHÀ VÔ ĐỊCH</p>
      </div>

      <div className="vip-panel">
        {race && !loading && (
          <div className="d-flex flex-wrap gap-4 mb-4" style={{ fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
            <div><span style={{ color: '#94a3b8' }}>Race: </span><strong style={{ color: '#fbbf24', fontSize: '1rem' }}>{race.name}</strong></div>
            {race.raceTime && <div><span style={{ color: '#94a3b8' }}>Giờ đua: </span><span style={{ color: '#e2e8f0' }}>{formatDate(race.raceTime)}</span></div>}
            {race.distance && <div><span style={{ color: '#94a3b8' }}>Cự ly: </span><span style={{ color: '#e2e8f0' }}>{race.distance} m</span></div>}
            <div><span style={{ color: '#94a3b8' }}>Số tham dự: </span><span style={{ color: '#e2e8f0' }}>{results.length} chiến mã</span></div>
          </div>
        )}

        {loading && <Loading />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && results.length === 0 && (
          <EmptyState message="Kết quả race này chưa được công bố." />
        )}
        
        {!loading && !error && results.length > 0 && (
          <div className="vip-table-wrapper">
            <table className="vip-table">
              <thead>
                <tr>
                  <th>Vị trí</th>
                  <th>Chiến mã</th>
                  <th>Jockey</th>
                  <th>Thời gian</th>
                  <th className="text-end">Giải thưởng (VND)</th>
                </tr>
              </thead>
              <tbody>
                {[...results].sort((a, b) => Number(a.position) - Number(b.position)).map((r) => {
                  const isWinner = r.position === 1;
                  return (
                    <tr key={r.id} style={isWinner ? { background: 'rgba(251,191,36,0.05)' } : {}}>
                      <td>
                        {isWinner ? <span className="vip-badge vip-badge-gold" style={{ fontSize: '1rem', padding: '6px 14px' }}>🏆 1</span> : 
                        <span style={{ opacity: 0.8 }}>#{r.position}</span>}
                      </td>
                      <td>
                        <strong style={isWinner ? { color: '#fbbf24', fontSize: '1.1rem' } : {}}>{r.horseName}</strong>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => setSelectedJockeyId(r.jockeyId)}
                          style={{
                            padding: 0,
                            border: 'none',
                            background: 'transparent',
                            color: '#e2e8f0',
                            textDecoration: 'underline',
                            textUnderlineOffset: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {r.jockeyName}
                        </button>
                      </td>
                      <td>{r.finishTime || '—'}</td>
                      <td className="text-end">
                        {r.prize != null ? <span style={{ color: isWinner ? '#fbbf24' : '#34d399', fontWeight: 600 }}>{formatCurrency(r.prize)}</span> : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal show={!!selectedJockeyId} onHide={() => setSelectedJockeyId(null)} centered size="lg">
        <Modal.Header closeButton style={{ background: '#141418', borderBottom: '1px solid rgba(251,191,36,0.2)' }}>
          <Modal.Title style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: 700 }}>
            🏇 Lịch sử thi đấu Jockey
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#141418' }}>
          {selectedJockeyId && <JockeyHistoryPanel jockeyId={selectedJockeyId} />}
        </Modal.Body>
      </Modal>
    </div>
  );
}
