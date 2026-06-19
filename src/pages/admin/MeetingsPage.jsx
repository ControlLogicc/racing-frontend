import { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { meetingService } from '../../services/meetingService';
import { seasonService } from '../../services/seasonService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';

const PAGE_SIZE = 10;

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ seasonId: '', name: '', racecourse: '', date: '' });

  const load = () => {
    Promise.all([meetingService.getAll(), seasonService.getAll()])
      .then(([m, s]) => { setMeetings(m); setSeasons(s); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách meeting.')))
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
      await meetingService.create({ ...form, seasonId: Number(form.seasonId) });
      setToast({ message: 'Tạo meeting thành công.', variant: 'success' });
      setForm({ seasonId: '', name: '', racecourse: '', date: '' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo meeting thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'name', label: 'Tên meeting' },
    { key: 'racecourse', label: 'Đường đua' },
    { key: 'date', label: 'Ngày', render: (r) => formatDate(r.date) },
  ];
  const pageRows = meetings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-header"><h2>Quản lý Meeting</h2></div>

      <Form onSubmit={handleCreate} className="dash-card d-flex flex-wrap gap-3 align-items-end mb-4">
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Season</Form.Label>
          <Form.Select value={form.seasonId} onChange={(e) => setForm({ ...form, seasonId: e.target.value })} required>
            <option value="">-- Chọn season --</option>
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Tên meeting</Form.Label>
          <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Đường đua</Form.Label>
          <Form.Control value={form.racecourse} onChange={(e) => setForm({ ...form, racecourse: e.target.value })} required />
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Ngày</Form.Label>
          <Form.Control type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </Form.Group>
        <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px' }}>Tạo Meeting</Button>
      </Form>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && meetings.length === 0 && <EmptyState message="Chưa có meeting nào." />}
      {!loading && !error && meetings.length > 0 && (
        <>
          <DataTable columns={columns} rows={pageRows} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={meetings.length} onPageChange={setPage} />
        </>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
