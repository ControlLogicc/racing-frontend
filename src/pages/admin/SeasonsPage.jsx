import { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { seasonService } from '../../services/seasonService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });

  const load = () => {
    seasonService
      .getAll()
      .then(setSeasons)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách season.')))
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
      await seasonService.create({ ...form, status: 'open' });
      setToast({ message: 'Tạo season thành công.', variant: 'success' });
      setForm({ name: '', startDate: '', endDate: '' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo season thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'name', label: 'Tên mùa giải' },
    { key: 'startDate', label: 'Bắt đầu' },
    { key: 'endDate', label: 'Kết thúc' },
    { key: 'status', label: 'Trạng thái' },
  ];

  return (
    <div>
      <div className="page-header"><h2>Quản lý Season</h2></div>

      <Form onSubmit={handleCreate} className="dash-card d-flex flex-wrap gap-3 align-items-end mb-4">
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Tên mùa giải</Form.Label>
          <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Bắt đầu</Form.Label>
          <Form.Control type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Kết thúc</Form.Label>
          <Form.Control type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
        </Form.Group>
        <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px' }}>Tạo Season</Button>
      </Form>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && seasons.length === 0 && <EmptyState message="Chưa có season nào." />}
      {!loading && !error && seasons.length > 0 && <DataTable columns={columns} rows={seasons} />}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
