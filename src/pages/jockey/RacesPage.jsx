import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { entryService } from '../../services/entryService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import EntryTable from '../../components/shared/EntryTable';

export default function JockeyRacesPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    entryService
      .getByJockey(user.userId)
      .then(setEntries)
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

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header"><h2>Lịch đua của tôi</h2></div>
      {entries.length === 0 ? (
        <EmptyState message="Bạn chưa có entry nào được xác nhận." />
      ) : (
        <EntryTable rows={entries} />
      )}
    </div>
  );
}
