import { useEffect, useState } from 'react';
import { resultService } from '../../services/resultService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import './spectator-theme.css'; // Import VIP Theme

export default function SpectatorRankingPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    resultService
      .getAll()
      .then(setResults)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được bảng xếp hạng.')))
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

  // BXH đơn giản: số lần về nhất (position = 1) theo ngựa.
  const ranking = Object.values(
    results.reduce((acc, r) => {
      const key = r.horseName;
      if (!acc[key]) acc[key] = { horseName: key, jockeyName: r.jockeyName, wins: 0, races: 0 };
      acc[key].races += 1;
      if (r.position === 1) acc[key].wins += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.wins - a.wins);

  return (
    <div className="spectator-context">
      <div className="spec-hero">
        <h2>BẢNG PHONG THẦN</h2>
        <p>VINH DANH NHỮNG CHIẾN MÃ VÀ NÀI NGỰA XUẤT SẮC NHẤT</p>
      </div>

      <div className="vip-panel">
        {loading && <Loading />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && ranking.length === 0 && <EmptyState message="Chưa có dữ liệu xếp hạng." />}
        
        {!loading && !error && ranking.length > 0 && (
          <div className="vip-table-wrapper">
            <table className="vip-table">
              <thead>
                <tr>
                  <th>Hạng</th>
                  <th>Chiến mã</th>
                  <th>Jockey</th>
                  <th>Số trận thắng</th>
                  <th>Tổng số trận</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={row.horseName}>
                      <td>
                        {rank === 1 && <span className="vip-badge vip-badge-gold">👑 #1</span>}
                        {rank === 2 && <span className="vip-badge vip-badge-emerald">🥈 #2</span>}
                        {rank === 3 && <span className="vip-badge" style={{ background: '#cd7f32', color: '#fff' }}>🥉 #3</span>}
                        {rank > 3 && <span>#{rank}</span>}
                      </td>
                      <td><strong>{row.horseName}</strong></td>
                      <td>{row.jockeyName}</td>
                      <td><span style={{ color: '#fbbf24', fontWeight: 600 }}>{row.wins}</span></td>
                      <td>{row.races}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
