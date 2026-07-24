import { useEffect, useState, useMemo } from 'react';
import { resultService } from '../../services/resultService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import Loading from '../common/Loading';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import DataTable from '../common/DataTable';
import Pagination from '../common/Pagination';
import RaceDetailModal from '../common/RaceDetailModal';

const PAGE_SIZE = 10;
const POSITION_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ flex: 1, minWidth: 130, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px' }}>
      <div style={{ fontSize: 18, marginBottom: 8 }}>{icon}</div>
      <div style={{ 
        fontSize: String(value).length > 10 ? '1.3rem' : '1.6rem', 
        fontWeight: 800, 
        color: color ?? '#D4AF37', 
        marginBottom: 4,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }} title={typeof value === 'string' || typeof value === 'number' ? value : ''}>
        {value}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  );
}

export default function JockeyHistoryPanel({ jockeyId }) {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [detailRaceId, setDetailRaceId] = useState(null);

  useEffect(() => {
    if (!jockeyId) return;
    setLoading(true);
    Promise.all([
      resultService.getByJockey(jockeyId),
      resultService.getJockeyStats(jockeyId).catch(() => null)
    ])
      .then(([r, s]) => {
        // Sort by date desc
        const sorted = r.sort((a, b) => new Date(b.raceDate || b.createdAt || 0) - new Date(a.raceDate || a.createdAt || 0));
        setResults(sorted);
        setStats(s);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được lịch sử.')))
      .finally(() => setLoading(false));
  }, [jockeyId]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, page]);

  const columns = [
    { key: 'raceDate', label: 'Ngày đua', render: (r) => formatDate(r.raceDate || r.createdAt) },
    { 
      key: 'raceName', 
      label: 'Race',
      render: (r) => (
        <button
          type="button"
          className="btn-link"
          onClick={() => setDetailRaceId(r.raceId)}
          style={{
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: '#60a5fa',
            textDecoration: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {r.raceName}
        </button>
      )
    },
    { key: 'horseName', label: 'Chiến mã', render: (r) => <strong style={{ color: '#e2e8f0' }}>{r.horseName}</strong> },
    {
      key: 'position',
      label: 'Vị trí',
      render: (r) => (
        <span style={{ fontWeight: 700, color: r.position === 1 ? '#D4AF37' : r.position <= 3 ? '#cd8c4a' : '#c8bea0' }}>
          {POSITION_MEDAL[r.position] ?? (r.position || '—')}
        </span>
      ),
    },
    { key: 'finishTime', label: 'Thời gian', render: (r) => r.finishTime || '—' },
    {
      key: 'prize',
      label: 'Giải thưởng',
      render: (r) => (
        <span style={{ color: r.prize ? '#4caf7d' : '#555', fontWeight: 600 }}>
          {r.prize ? formatCurrency(r.prize) : '—'}
        </span>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => setLoading(true)} />;

  return (
    <div className="jockey-history-panel" style={{ color: '#e2e8f0' }}>
      {/* Stats Cards */}
      {stats && (
        <div className="d-flex gap-3 mb-4 flex-wrap">
          <StatCard icon="🏁" label="Số lần đua" value={stats.totalRaces} color="#94a3b8" />
          <StatCard icon="🥇" label="Số lần Win" value={stats.totalWins} color="#D4AF37" />
          <StatCard icon="🏅" label="Số lần Top 3" value={stats.top3Finishes} color="#cd8c4a" />
          <StatCard icon="📈" label="Tỷ lệ Win" value={`${(stats.winRate || 0).toFixed(1)}%`} color="#60a5fa" />
          <StatCard icon="💰" label="Tổng thưởng" value={stats.totalPrizeAmount ? formatCurrency(stats.totalPrizeAmount) : '—'} color="#4caf7d" />
        </div>
      )}

      {/* Results Table */}
      <div>
        <h5 style={{ color: '#D4AF37', marginBottom: 16 }}>Lịch sử thi đấu</h5>
        {results.length === 0 ? (
          <EmptyState message="Jockey này chưa có kết quả đua nào." />
        ) : (
          <>
            <DataTable columns={columns} rows={paginated} />
            <div className="mt-3">
              <Pagination page={page} pageSize={PAGE_SIZE} total={results.length} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <RaceDetailModal
        show={!!detailRaceId}
        onHide={() => setDetailRaceId(null)}
        raceId={detailRaceId}
      />
    </div>
  );
}
