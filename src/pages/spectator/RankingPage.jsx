import { useEffect, useState } from 'react';
import { resultService } from '../../services/resultService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';

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

  const columns = [
    { key: 'rank', label: '#', render: (row) => ranking.indexOf(row) + 1 },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'jockeyName', label: 'Jockey' },
    { key: 'wins', label: 'Số lần về nhất' },
    { key: 'races', label: 'Số race đã đua' },
  ];

  return (
    <div className="pub-page">
      <section className="container pt-5">
        <div className="pub-section-title-wrap"><h2 className="pub-section-title">Bảng xếp hạng</h2></div>
        {loading && <Loading />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && ranking.length === 0 && <EmptyState message="Chưa có dữ liệu xếp hạng." />}
        {!loading && !error && ranking.length > 0 && (
          <DataTable columns={columns} rows={ranking} rowKey="horseName" />
        )}
      </section>
    </div>
  );
}
