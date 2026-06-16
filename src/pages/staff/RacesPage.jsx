import { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { raceService } from '../../services/raceService';
import { meetingService } from '../../services/meetingService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';

const PAGE_SIZE = 10;

export default function RacesPage() {
  const [races, setRaces] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ meetingId: '', name: '', distance: '', raceTime: '' });

  const load = () => {
    Promise.all([raceService.getAll(), meetingService.getAll()])
      .then(([r, m]) => { setRaces(r); setMeetings(m); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách race.')))
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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await raceService.create({ ...form, meetingId: Number(form.meetingId), distance: Number(form.distance) });
      setToast({ message: 'Tạo race thành công.', variant: 'success' });
      setForm({ meetingId: '', name: '', distance: '', raceTime: '' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo race thất bại.'), variant: 'danger' });
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await raceService.setStatus(id, status);
      setToast({ message: 'Cập nhật trạng thái race thành công.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'name', label: 'Tên race' },
    { key: 'distance', label: 'Cự ly (m)' },
    { key: 'raceTime', label: 'Giờ đua', render: (r) => formatDate(r.raceTime) },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Hành động',
      render: (r) => (
        <Form.Select
          size="sm"
          value={r.status}
          style={{ maxWidth: 160 }}
          onChange={(e) => handleStatusChange(r.id, e.target.value)}
        >
          {Object.values(RACE_STATUS).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Form.Select>
      ),
    },
  ];
  const pageRows = races.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-header"><h2>Quản lý Race</h2></div>

      <Form onSubmit={handleCreate} className="dash-card d-flex flex-wrap gap-3 align-items-end mb-4">
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Meeting</Form.Label>
          <Form.Select value={form.meetingId} onChange={(e) => setForm({ ...form, meetingId: e.target.value })} required>
            <option value="">-- Chọn meeting --</option>
            {meetings.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Tên race</Form.Label>
          <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Cự ly (m)</Form.Label>
          <Form.Control type="number" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} required />
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Giờ đua</Form.Label>
          <Form.Control type="datetime-local" value={form.raceTime} onChange={(e) => setForm({ ...form, raceTime: e.target.value })} required />
        </Form.Group>
        <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px' }}>Tạo Race</Button>
      </Form>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && races.length === 0 && <EmptyState message="Chưa có race nào." />}
      {!loading && !error && races.length > 0 && (
        <>
          <DataTable columns={columns} rows={pageRows} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={races.length} onPageChange={setPage} />
        </>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
