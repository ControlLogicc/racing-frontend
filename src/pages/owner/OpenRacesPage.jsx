import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';

export default function OwnerOpenRacesPage() {
  const navigate = useNavigate();
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    raceService
      .getAll()
      .then((data) => setRaces(data.filter((r) => r.status === RACE_STATUS.UPCOMING)))
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách race.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const columns = [
    { key: 'name', label: 'Tên race' },
    { key: 'meetingName', label: 'Meeting' },
    { key: 'distance', label: 'Cự ly (m)' },
    { key: 'raceTime', label: 'Giờ đua', render: (r) => formatDate(r.raceTime) },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button
          className="btn-gold-sm"
          style={{ padding: '5px 14px', fontSize: 13 }}
          onClick={() => navigate(`/owner/register?raceId=${r.id}`)}
        >
          + Đăng ký
        </Button>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header"><h2>Races đang mở</h2></div>
      {races.length === 0 ? (
        <EmptyState message="Hiện không có race nào đang mở để đăng ký." />
      ) : (
        <DataTable columns={columns} rows={races} />
      )}
    </div>
  );
}
