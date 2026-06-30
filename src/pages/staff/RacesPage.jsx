import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';
import './staff-theme.css';

const RACE_STATUS_FLOW = [
  RACE_STATUS.DRAFT,
  RACE_STATUS.SCHEDULED,
  RACE_STATUS.OPEN_FOR_ENTRY,
  RACE_STATUS.CLOSED_FOR_ENTRY,
  RACE_STATUS.RUNNING,
  RACE_STATUS.RESULT_PENDING,
  RACE_STATUS.OFFICIAL,
  RACE_STATUS.CANCELLED,
];

const isTransitionAllowed = (oldStatus, newStatus) => {
  if (oldStatus === newStatus) return true;
  switch (oldStatus) {
    case RACE_STATUS.DRAFT:
      return newStatus === RACE_STATUS.SCHEDULED || newStatus === RACE_STATUS.CANCELLED;
    case RACE_STATUS.SCHEDULED:
      return newStatus === RACE_STATUS.OPEN_FOR_ENTRY || newStatus === RACE_STATUS.CANCELLED;
    case RACE_STATUS.OPEN_FOR_ENTRY:
      return newStatus === RACE_STATUS.CLOSED_FOR_ENTRY || newStatus === RACE_STATUS.CANCELLED;
    case RACE_STATUS.CLOSED_FOR_ENTRY:
      return newStatus === RACE_STATUS.RUNNING || newStatus === RACE_STATUS.CANCELLED;
    case RACE_STATUS.RUNNING:
      return newStatus === RACE_STATUS.RESULT_PENDING;
    case RACE_STATUS.RESULT_PENDING:
      return newStatus === RACE_STATUS.OFFICIAL;
    default:
      return false;
  }
};

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

  const handleStatusChange = async (id, status) => {
    try {
      const raceToUpdate = races.find((r) => r.id === id);
      if (!raceToUpdate) throw new Error('Race not found in local state.');
      if (raceToUpdate.status === status) return;

      if (!isTransitionAllowed(raceToUpdate.status, status)) {
        setToast({ message: 'Không thể chuyển sang trạng thái này.', variant: 'warning' });
        return;
      }
      await raceService.setStatus(id, status);
      setToast({ message: 'Cập nhật trạng thái race thành công.', variant: 'success' });
      load();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'raceNo', label: 'Race No', render: (row) => row.raceNo || '—' },
    { key: 'name', label: 'Tên Race', render: (row) => (
      <Link to={`/staff/races/${row.id}`} style={{ color: '#f8fafc', fontWeight: 600, textDecoration: 'none' }}>
        {row.name}
      </Link>
    )},
    { key: 'meetingName', label: 'Meeting', render: (row) => row.meetingName || '—' },
    { key: 'raceTime', label: 'Ngày đua', render: (row) => formatDate(row.raceTime) },
    { key: 'trackType', label: 'Loại đường đua', render: (row) => row.trackType || '—' },
    { key: 'classRequirement', label: 'Class', render: (row) => row.classRequirement || '—' },
    {
      key: 'entries',
      label: 'Số ngựa (Min–Max)',
      render: (row) =>
        row.minEntries != null && row.maxEntries != null
          ? `${row.minEntries} – ${row.maxEntries}`
          : '—',
    },
    { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'statusAction',
      label: 'Đổi trạng thái',
      render: (row) => (
        <Form.Select
          size="sm"
          value={row.status}
          style={{ maxWidth: 170, background: '#1e293b', color: '#f8fafc', border: '1px solid #475569' }}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
        >
          {RACE_STATUS_FLOW.map((s) => (
            <option key={s} value={s} disabled={!isTransitionAllowed(row.status, s)}>{s}</option>
          ))}
        </Form.Select>
      ),
    },
    {
      key: 'detail',
      label: '',
      render: (row) => (
        <Link to={`/staff/races/${row.id}`}>
          <Button size="sm" className="staff-btn-outline">Chi tiết</Button>
        </Link>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (races.length === 0) return <EmptyState message="Bạn chưa được phân công race nào. Liên hệ Admin để được gán." />;

  return (
    <div className="staff-theme-wrapper p-3">
      <div className="staff-card mb-4 p-4">
        <h4 className="mb-1" style={{ color: '#D4AF37', fontWeight: 700 }}>Races của tôi</h4>
        <p className="mb-0" style={{ color: '#9ca3af', fontSize: 13 }}>Danh sách các cuộc đua bạn được phân công phụ trách.</p>
      </div>
      <div className="staff-card p-3">
        <DataTable columns={columns} rows={races} rowClassName={() => 'align-middle'} />
      </div>
      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
