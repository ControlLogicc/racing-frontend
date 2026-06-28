import { useEffect, useState, useMemo } from 'react';
import { resultService } from '../../services/resultService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import './spectator-theme.css';

const RANK_BADGE = {
  1: <span className="vip-badge vip-badge-gold">👑 #1</span>,
  2: <span className="vip-badge vip-badge-emerald">🥈 #2</span>,
  3: <span className="vip-badge" style={{ background: '#cd7f32', color: '#fff' }}>🥉 #3</span>,
};

export default function SpectatorRankingPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('wins'); // wins | winRate | races

  const load = () => {
    resultService.getAll()
      .then(setResults)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được bảng xếp hạng.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const ranking = useMemo(() => {
    const map = results.reduce((acc, r) => {
      const key = r.horseName;
      if (!key) return acc;
      if (!acc[key]) acc[key] = { horseName: key, jockeyName: r.jockeyName, wins: 0, top3: 0, races: 0 };
      acc[key].races += 1;
      if (r.position === 1) acc[key].wins += 1;
      if (r.position <= 3) acc[key].top3 += 1;
      return acc;
    }, {});

    return Object.values(map)
      .map((row) => ({ ...row, winRate: row.races > 0 ? ((row.wins / row.races) * 100).toFixed(0) : 0 }))
      .sort((a, b) => {
        if (sortBy === 'winRate') return Number(b.winRate) - Number(a.winRate);
        if (sortBy === 'races') return b.races - a.races;
        return b.wins - a.wins;
      });
  }, [results, sortBy]);

  const refetch = () => { setLoading(true); setError(''); load(); };

  return (
    <div className="spectator-context">
      <div className="spec-hero">
        <h2>BẢNG PHONG THẦN</h2>
        <p>VINH DANH NHỮNG CHIẾN MÃ VÀ NÀI NGỰA XUẤT SẮC NHẤT</p>
      </div>

      {!loading && !error && ranking.length > 0 && (
        <div className="vip-panel mb-4 py-2">
          <div className="d-flex align-items-center gap-3">
            <span style={{ color: '#94a3b8', fontSize: 13 }}>Sắp xếp theo:</span>
            {[
              { key: 'wins', label: 'Số lần thắng' },
              { key: 'winRate', label: 'Tỉ lệ thắng' },
              { key: 'races', label: 'Số trận' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                style={{
                  background: sortBy === opt.key ? 'rgba(251,191,36,0.15)' : 'transparent',
                  border: `1px solid ${sortBy === opt.key ? '#fbbf24' : '#334155'}`,
                  color: sortBy === opt.key ? '#fbbf24' : '#94a3b8',
                  borderRadius: 6, padding: '4px 12px', fontSize: 13, cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
                  <th>Thắng</th>
                  <th>Top 3</th>
                  <th>Tổng trận</th>
                  <th>Tỉ lệ thắng</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={row.horseName} style={rank === 1 ? { background: 'rgba(251,191,36,0.04)' } : {}}>
                      <td>{RANK_BADGE[rank] || <span style={{ color: '#64748b' }}>#{rank}</span>}</td>
                      <td><strong style={{ color: rank === 1 ? '#fbbf24' : '#e2e8f0' }}>{row.horseName}</strong></td>
                      <td style={{ color: '#94a3b8' }}>{row.jockeyName || '—'}</td>
                      <td><span style={{ color: '#fbbf24', fontWeight: 700 }}>{row.wins}</span></td>
                      <td style={{ color: '#34d399' }}>{row.top3}</td>
                      <td style={{ color: '#94a3b8' }}>{row.races}</td>
                      <td>
                        <span style={{ color: Number(row.winRate) >= 50 ? '#34d399' : '#94a3b8', fontWeight: 600 }}>
                          {row.winRate}%
                        </span>
                      </td>
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
