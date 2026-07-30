import { useEffect, useMemo, useState } from 'react';
import { horseService } from '../../services/horseService';
import { resultService } from '../../services/resultService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatCurrency } from '../../utils/formatCurrency';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import './spectator-theme.css';

const RANK_BADGE = {
  1: <span className="vip-badge vip-badge-gold">👑 #1</span>,
  2: <span className="vip-badge vip-badge-emerald">🥈 #2</span>,
  3: <span className="vip-badge" style={{ background: '#cd7f32', color: '#fff' }}>🥉 #3</span>,
};

const VIEW_OPTIONS = [
  { value: 'horse', label: 'BXH Ngựa' },
  { value: 'jockey', label: 'BXH Jockey' },
];

const HORSE_SORTS = [
  { key: 'rating', label: 'Rating' },
  { key: 'wins', label: 'Số lần thắng' },
  { key: 'winRate', label: 'Tỉ lệ thắng' },
  { key: 'races', label: 'Số trận' },
];

const JOCKEY_SORTS = [
  { key: 'winRate', label: 'Tỉ lệ thắng' },
  { key: 'wins', label: 'Số lần thắng' },
  { key: 'top3', label: 'Top 3' },
  { key: 'prize', label: 'Tổng thưởng' },
  { key: 'races', label: 'Số trận' },
];

const getPosition = (result) => Number(result.position || 0);
const getPrize = (result) => Number(result.prizeAmount ?? result.prize ?? 0);
const getRate = (wins, races) => (races > 0 ? Math.round((wins / races) * 100) : 0);

function buildHorseRanking(horses, results) {
  const resultStats = results.reduce((acc, result) => {
    const key = result.horseId ? `id:${result.horseId}` : `name:${result.horseName}`;
    if (!result.horseName && !result.horseId) return acc;

    if (!acc[key]) {
      acc[key] = {
        horseId: result.horseId,
        horseName: result.horseName,
        jockeyNames: new Set(),
        wins: 0,
        top3: 0,
        races: 0,
        prize: 0,
      };
    }

    const position = getPosition(result);
    acc[key].races += 1;
    acc[key].prize += getPrize(result);
    if (position === 1) acc[key].wins += 1;
    if (position > 0 && position <= 3) acc[key].top3 += 1;
    if (result.jockeyName) acc[key].jockeyNames.add(result.jockeyName);

    return acc;
  }, {});

  const rows = horses.map((horse) => {
    const keyById = `id:${horse.id}`;
    const keyByName = `name:${horse.name}`;
    const stats = resultStats[keyById] || resultStats[keyByName] || {
      jockeyNames: new Set(),
      wins: 0,
      top3: 0,
      races: 0,
      prize: 0,
    };

    delete resultStats[keyById];
    delete resultStats[keyByName];

    return {
      id: horse.id,
      horseName: horse.name,
      ownerName: horse.ownerName,
      rating: horse.rating != null ? Number(horse.rating) : null,
      horseClass: horse.horseClass,
      jockeyNames: Array.from(stats.jockeyNames).join(', '),
      wins: stats.wins,
      top3: stats.top3,
      races: stats.races,
      prize: stats.prize,
      winRate: getRate(stats.wins, stats.races),
    };
  });

  Object.values(resultStats).forEach((stats) => {
    rows.push({
      id: stats.horseId || stats.horseName,
      horseName: stats.horseName || 'Không rõ',
      ownerName: '',
      rating: null,
      horseClass: null,
      jockeyNames: Array.from(stats.jockeyNames).join(', '),
      wins: stats.wins,
      top3: stats.top3,
      races: stats.races,
      prize: stats.prize,
      winRate: getRate(stats.wins, stats.races),
    });
  });

  return rows;
}

function buildJockeyRanking(results) {
  const map = results.reduce((acc, result) => {
    const key = result.jockeyId ? `id:${result.jockeyId}` : `name:${result.jockeyName}`;
    if (!result.jockeyName && !result.jockeyId) return acc;

    if (!acc[key]) {
      acc[key] = {
        jockeyId: result.jockeyId,
        jockeyName: result.jockeyName,
        horseNames: new Set(),
        wins: 0,
        top3: 0,
        races: 0,
        prize: 0,
      };
    }

    const position = getPosition(result);
    acc[key].races += 1;
    acc[key].prize += getPrize(result);
    if (position === 1) acc[key].wins += 1;
    if (position > 0 && position <= 3) acc[key].top3 += 1;
    if (result.horseName) acc[key].horseNames.add(result.horseName);

    return acc;
  }, {});

  return Object.values(map).map((row) => ({
    ...row,
    horseNames: Array.from(row.horseNames).join(', '),
    winRate: getRate(row.wins, row.races),
    top3Rate: row.races > 0 ? Math.round((row.top3 / row.races) * 100) : 0,
  }));
}

function sortRows(rows, sortBy, viewMode) {
  return [...rows].sort((a, b) => {
    if (sortBy === 'rating') {
      return (Number(b.rating ?? -1) - Number(a.rating ?? -1))
        || b.wins - a.wins
        || b.top3 - a.top3
        || b.races - a.races;
    }
    if (sortBy === 'winRate') {
      return b.winRate - a.winRate
        || b.wins - a.wins
        || b.top3 - a.top3
        || b.races - a.races;
    }
    if (sortBy === 'top3') {
      return b.top3 - a.top3
        || b.winRate - a.winRate
        || b.wins - a.wins;
    }
    if (sortBy === 'prize') {
      return b.prize - a.prize
        || b.wins - a.wins
        || b.winRate - a.winRate;
    }
    if (sortBy === 'races') {
      return b.races - a.races
        || b.wins - a.wins
        || b.winRate - a.winRate;
    }
    return b.wins - a.wins
      || (viewMode === 'jockey' ? b.winRate - a.winRate : Number(b.rating ?? -1) - Number(a.rating ?? -1))
      || b.top3 - a.top3
      || b.races - a.races;
  });
}

function SortButtons({ options, active, onChange }) {
  return (
    <div className="ranking-sort-group">
      <span className="ranking-sort-label">Xếp hạng theo:</span>
      <div className="ranking-segmented" role="group" aria-label="Xếp hạng theo">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className={`ranking-segment ${active === opt.key ? 'active' : ''}`}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </button>
      ))}
      </div>
    </div>
  );
}

export default function SpectatorRankingPage() {
  const [results, setResults] = useState([]);
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('horse');
  const [horseSortBy, setHorseSortBy] = useState('rating');
  const [jockeySortBy, setJockeySortBy] = useState('winRate');

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      resultService.getAll(),
      horseService.getPublicAll().catch(() => []),
    ])
      .then(([resultData, horseData]) => {
        setResults(resultData);
        setHorses(horseData);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được bảng xếp hạng.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const horseRanking = useMemo(() => buildHorseRanking(horses, results), [horses, results]);
  const jockeyRanking = useMemo(() => buildJockeyRanking(results), [results]);

  const ranking = useMemo(() => {
    const rows = viewMode === 'jockey' ? jockeyRanking : horseRanking;
    const sortBy = viewMode === 'jockey' ? jockeySortBy : horseSortBy;
    return sortRows(rows, sortBy, viewMode);
  }, [horseRanking, horseSortBy, jockeyRanking, jockeySortBy, viewMode]);

  const sortOptions = viewMode === 'jockey' ? JOCKEY_SORTS : HORSE_SORTS;
  const sortBy = viewMode === 'jockey' ? jockeySortBy : horseSortBy;
  const setSortBy = viewMode === 'jockey' ? setJockeySortBy : setHorseSortBy;
  const title = viewMode === 'jockey' ? 'Bảng xếp hạng Jockey' : 'Bảng xếp hạng Ngựa';
  const subtitle = viewMode === 'jockey'
    ? 'Xếp hạng nài ngựa theo tỉ lệ thắng, số trận thắng và top 3.'
    : 'Xếp hạng chiến mã theo rating, kèm thành tích thi đấu đã công bố.';

  const refetch = () => { load(); };

  return (
    <div className="spectator-context">
      <div className="spec-hero">
        <h2>BẢNG XẾP HẠNG</h2>
        <p>{subtitle.toUpperCase()}</p>
      </div>

      {!loading && !error && (
        <div className="vip-panel mb-4 py-3">
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Chọn bảng:</span>
              <select
                className="form-select"
                value={viewMode}
                onChange={(event) => setViewMode(event.target.value)}
                style={{
                  width: 180,
                  background: '#0f172a',
                  border: '1px solid rgba(251,191,36,0.45)',
                  color: '#f8fafc',
                  borderRadius: 6,
                  fontSize: 13,
                }}
              >
                {VIEW_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {ranking.length > 0 && (
              <SortButtons options={sortOptions} active={sortBy} onChange={setSortBy} />
            )}
          </div>
        </div>
      )}

      <div className="vip-panel">
        <div className="vip-panel-header">{title}</div>

        {loading && <Loading />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && ranking.length === 0 && <EmptyState message="Chưa có dữ liệu xếp hạng." />}

        {!loading && !error && ranking.length > 0 && viewMode === 'horse' && (
          <div className="vip-table-wrapper">
            <table className="vip-table">
              <thead>
                <tr>
                  <th>Hạng</th>
                  <th>Chiến mã</th>
                  <th>Rating</th>
                  <th>Class</th>
                  <th>Thắng</th>
                  <th>Top 3</th>
                  <th>Tổng trận</th>
                  <th>Tỉ lệ thắng</th>
                  <th>Tổng thưởng</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={row.id || row.horseName} style={rank === 1 ? { background: 'rgba(251,191,36,0.04)' } : {}}>
                      <td>{RANK_BADGE[rank] || <span style={{ color: '#64748b' }}>#{rank}</span>}</td>
                      <td>
                        <strong style={{ color: rank === 1 ? '#fbbf24' : '#e2e8f0' }}>{row.horseName}</strong>
                        {row.ownerName && <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>{row.ownerName}</div>}
                      </td>
                      <td><span style={{ color: '#fbbf24', fontWeight: 700 }}>{row.rating ?? '—'}</span></td>
                      <td style={{ color: '#94a3b8' }}>{row.horseClass ? `C${row.horseClass}` : '—'}</td>
                      <td><span style={{ color: '#fbbf24', fontWeight: 700 }}>{row.wins}</span></td>
                      <td style={{ color: '#34d399' }}>{row.top3}</td>
                      <td style={{ color: '#94a3b8' }}>{row.races}</td>
                      <td>
                        <span style={{ color: row.winRate >= 50 ? '#34d399' : '#94a3b8', fontWeight: 600 }}>
                          {row.winRate}%
                        </span>
                      </td>
                      <td style={{ color: '#34d399', fontWeight: 700 }}>{formatCurrency(row.prize)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && ranking.length > 0 && viewMode === 'jockey' && (
          <div className="vip-table-wrapper">
            <table className="vip-table">
              <thead>
                <tr>
                  <th>Hạng</th>
                  <th>Jockey</th>
                  <th>Thắng</th>
                  <th>Top 3</th>
                  <th>Tổng trận</th>
                  <th>Tỉ lệ thắng</th>
                  <th>Tỉ lệ top 3</th>
                  <th>Tổng thưởng</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={row.jockeyId || row.jockeyName} style={rank === 1 ? { background: 'rgba(251,191,36,0.04)' } : {}}>
                      <td>{RANK_BADGE[rank] || <span style={{ color: '#64748b' }}>#{rank}</span>}</td>
                      <td>
                        <strong style={{ color: rank === 1 ? '#fbbf24' : '#e2e8f0' }}>{row.jockeyName || 'Không rõ'}</strong>
                        {row.horseNames && <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>{row.horseNames}</div>}
                      </td>
                      <td><span style={{ color: '#fbbf24', fontWeight: 700 }}>{row.wins}</span></td>
                      <td style={{ color: '#34d399' }}>{row.top3}</td>
                      <td style={{ color: '#94a3b8' }}>{row.races}</td>
                      <td>
                        <span style={{ color: row.winRate >= 50 ? '#34d399' : '#94a3b8', fontWeight: 700 }}>
                          {row.winRate}%
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8' }}>{row.top3Rate}%</td>
                      <td style={{ color: '#34d399', fontWeight: 700 }}>{formatCurrency(row.prize)}</td>
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
