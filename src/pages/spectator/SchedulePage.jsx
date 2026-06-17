import { useEffect, useState } from 'react';
import { raceService } from '../../services/raceService';
import { meetingService } from '../../services/meetingService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';

export default function SpectatorSchedulePage() {
  const [races, setRaces] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    Promise.all([raceService.getAll(), meetingService.getAll()])
      .then(([r, m]) => { setRaces(r); setMeetings(m); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được lịch đua.')))
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

  const columns = [
    { key: 'name', label: 'Race' },
    { key: 'meetingId', label: 'Meeting', render: (r) => meetings.find((m) => m.id === r.meetingId)?.name || '—' },
    { key: 'raceTime', label: 'Giờ đua', render: (r) => formatDate(r.raceTime) },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="pub-page">
      <section className="container pt-5">
        <div className="pub-section-title-wrap"><h2 className="pub-section-title">Lịch đua</h2></div>
        {loading && <Loading />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && races.length === 0 && <EmptyState message="Chưa có race nào." />}
        {!loading && !error && races.length > 0 && <DataTable columns={columns} rows={races} />}
      </section>
    </div>
  );
}
