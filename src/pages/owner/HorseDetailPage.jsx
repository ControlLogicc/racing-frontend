import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Badge } from 'react-bootstrap';
import { horseService } from '../../services/horseService';
import { resultService } from '../../services/resultService';
import { seasonService } from '../../services/seasonService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_RESULT_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

const PAGE_SIZE = 10;

const POSITION_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

function getRatingClass(rating) {
  if (rating >= 85) return 'Class 1';
  if (rating >= 80) return 'Class 2';
  if (rating >= 60) return 'Class 3';
  if (rating >= 40) return 'Class 4';
  return 'Class 5';
}

function StatBox({ label, value, color }) {
  return (
    <div className="dash-card text-center" style={{ flex: 1 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? '#D4AF37' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function HorseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [horse, setHorse] = useState(null);
  const [results, setResults] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      horseService.getById(Number(id)),
      resultService.getByHorse(Number(id)),
      seasonService.getAll(),
    ])
      .then(([h, r, s]) => {
        setHorse(h);
        setResults(r.filter((res) => res.resultStatus === RACE_RESULT_STATUS.PUBLISHED || res.resultStatus === RACE_RESULT_STATUS.FINAL_EDITED_BY_STAFF));
        setSeasons(s);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu.')))
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = useMemo(() => {
    if (!seasonFilter) return results;
    return results.filter((r) => String(r.seasonId) === seasonFilter);
  }, [results, seasonFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const stats = useMemo(() => {
    const wins = filtered.filter((r) => r.position === 1).length;
    const totalPrize = filtered.reduce((sum, r) => sum + (r.prize ?? 0), 0);
    const avgScore = horse?.rating ?? 0;
    return { wins, totalPrize, avgScore };
  }, [filtered, horse]);

  const columns = [
    { key: 'raceName', label: 'Race' },
    { key: 'raceDate', label: 'Ngày đua', render: (r) => formatDate(r.raceDate) },
    { key: 'seasonName', label: 'Season' },
    {
      key: 'position',
      label: 'Vị trí',
      render: (r) => (
        <span style={{ fontWeight: 700, color: r.position === 1 ? '#D4AF37' : '#fff' }}>
          {POSITION_MEDAL[r.position] ?? ''} {r.position}
        </span>
      ),
    },
    {
      key: 'prize',
      label: 'Giải thưởng',
      render: (r) => (
        <span style={{ color: '#4caf7d', fontWeight: 600 }}>
          {r.prize ? `$${r.prize.toLocaleString()}` : '—'}
        </span>
      ),
    },
    { key: 'finishTime', label: 'Thời gian' },
    { key: 'jockeyName', label: 'Jockey' },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!horse) return <ErrorState message="Không tìm thấy ngựa." />;

  const ratingClass = getRatingClass(horse.rating ?? 0);

  return (
    <div>
      <div className="page-header">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate('/owner/horses')}
            style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: 20 }}
          >
            ←
          </button>
          <h2 style={{ margin: 0 }}>{horse.name}</h2>
        </div>
      </div>

      {/* Horse info */}
      <div className="dash-card d-flex flex-wrap gap-4 align-items-center mb-4">
        <div style={{ fontSize: 56 }}>🐎</div>
        <div className="d-flex flex-column gap-1">
          <div style={{ color: '#888', fontSize: 13 }}>Tuổi: <strong style={{ color: '#fff' }}>{horse.age}</strong></div>
          <div style={{ color: '#888', fontSize: 13 }}>Giống: <strong style={{ color: '#fff' }}>{horse.breed}</strong></div>
        </div>
        <div className="d-flex flex-column gap-1">
          <div style={{ color: '#888', fontSize: 13 }}>Rating hiện tại</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#D4AF37' }}>{horse.rating ?? '—'}</div>
          <Badge bg="warning" text="dark" style={{ width: 'fit-content' }}>{ratingClass}</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <StatBox label="Số lần thắng" value={stats.wins} color="#D4AF37" />
        <StatBox label="Tổng giải thưởng" value={`$${stats.totalPrize.toLocaleString()}`} color="#4caf7d" />
        <StatBox label="Rating hiện tại" value={horse.rating ?? '—'} color="#64b5f6" />
        <StatBox label="Số lần thi đấu" value={filtered.length} color="#ccc" />
      </div>

      {/* Filter */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <Form.Select
          value={seasonFilter}
          onChange={(e) => { setSeasonFilter(e.target.value); setPage(1); }}
          style={{ maxWidth: 220 }}
        >
          <option value="">Tất cả season</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Form.Select>
        {seasonFilter && (
          <button
            onClick={() => { setSeasonFilter(''); setPage(1); }}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13 }}
          >
            ✕ Xoá filter
          </button>
        )}
      </div>

      {/* Results table */}
      {filtered.length === 0 ? (
        <EmptyState message="Ngựa này chưa có kết quả nào được công bố." />
      ) : (
        <>
          <DataTable columns={columns} rows={paginated} />
          <div className="mt-3">
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
