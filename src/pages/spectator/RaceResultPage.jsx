import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { resultService } from '../../services/resultService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import RaceResultTable from '../../components/shared/RaceResultTable';

// Fix #2: appendChild + setTimeout revokeObjectURL để tránh download fail trên Firefox
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
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ket-qua-${race?.name ?? 'race'}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export default function RaceResultPage() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fix #5: guard NaN khi raceId thiếu hoặc không phải số
  const numericId = Number(raceId);

  const load = () => {
    Promise.all([
      resultService.getByRace(numericId),
      raceService.getById(numericId),
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
    <div className="pub-page">
      <section className="container pt-5 pb-5">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
          <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
            ← Quay lại
          </Button>
          <div className="pub-section-title-wrap flex-grow-1 mb-0">
            <h2 className="pub-section-title mb-0">
              Kết quả {race ? `— ${race.name}` : ''}
            </h2>
          </div>
          {!loading && !error && results.length > 0 && (
            <Button className="btn-gold-sm" size="sm" onClick={() => exportCSV(race, results)}>
              Xuất CSV
            </Button>
          )}
        </div>

        {/* Race meta */}
        {race && !loading && (
          <div className="dash-card d-flex flex-wrap gap-4 mb-4" style={{ fontSize: 14 }}>
            <div><span style={{ color: '#888' }}>Race: </span><strong style={{ color: '#D4AF37' }}>{race.name}</strong></div>
            {race.raceTime && <div><span style={{ color: '#888' }}>Giờ đua: </span><span style={{ color: '#ccc' }}>{formatDate(race.raceTime)}</span></div>}
            {race.distance && <div><span style={{ color: '#888' }}>Cự ly: </span><span style={{ color: '#ccc' }}>{race.distance} m</span></div>}
            <div><span style={{ color: '#888' }}>Số tham dự: </span><span style={{ color: '#ccc' }}>{results.length} ngựa</span></div>
          </div>
        )}

        {/* Table */}
        {loading && <Loading />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && results.length === 0 && (
          <EmptyState message="Kết quả race này chưa được công bố." />
        )}
        {!loading && !error && results.length > 0 && (
          <RaceResultTable rows={results} showPrize highlightFirst />
        )}
      </section>
    </div>
  );
}
