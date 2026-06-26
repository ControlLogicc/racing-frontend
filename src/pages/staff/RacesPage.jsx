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
import './staff-theme.css';

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
    // eslint-disable-next-line
    load();
  }, []);

  const columns = [
    { key: 'raceNo', label: 'Race No', render: (row) => row.raceNo || '—' },
    { key: 'name', label: 'Tên Race' },
    { key: 'meetingName', label: 'Meeting', render: (row) => row.meetingName || '—' },
    { key: 'raceTime', label: 'Ngày đua', render: (row) => formatDate(row.raceTime) },
    { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => (
        <Link to={`/staff/races/${row.id}`}>
          <Button className="staff-btn-outline" size="sm">Xem chi tiết</Button>
        </Link>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (races.length === 0) return <EmptyState message="Bạn chưa được phân công race nào. Liên hệ Admin để được gán." />;

  return (
    <div className="staff-theme-wrapper p-3">
      <div className="page-header mb-4">
        <div>
          <h2 className="staff-header-title">Races của tôi</h2>
          <p className="staff-subtitle mb-0">Danh sách các cuộc đua bạn được phân công phụ trách.</p>
        </div>
      </div>
      <div className="staff-card p-3">
        <DataTable columns={columns} rows={races} rowClassName={() => 'align-middle'} />
      </div>
      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
