import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';

export default function StaffRacesPage() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    raceService.getAssignedToStaff()
      .then(setRaces)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách race.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { key: 'raceNo', label: 'Race No', render: (val) => val || '—' },
    { key: 'name', label: 'Tên Race' },
    { key: 'meetingName', label: 'Meeting', render: (val) => val || '—' },
    { key: 'raceTime', label: 'Ngày đua', render: (val) => formatDate(val) },
    { key: 'status', label: 'Trạng thái', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'actions',
      label: 'Hành động',
      render: (_, race) => (
        <Link to={`/staff/races/${race.id}`}>
          <Button variant="outline-primary" size="sm">Xem chi tiết</Button>
        </Link>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (races.length === 0) return <EmptyState message="Bạn chưa được phân công race nào. Liên hệ Admin để được gán." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Races của tôi</h2>
          <p className="text-muted mb-0">Danh sách các cuộc đua bạn được phân công phụ trách.</p>
        </div>
      </div>
      <DataTable columns={columns} data={races} />
      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
