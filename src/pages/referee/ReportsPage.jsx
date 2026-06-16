import { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { refereeReportService } from '../../services/refereeReportService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';

export default function RefereeReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ raceId: '', content: '' });

  const load = () => {
    Promise.all([refereeReportService.getAll(), raceService.getAll()])
      .then(([rep, r]) => { setReports(rep); setRaces(r); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được báo cáo.')))
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
    const race = races.find((r) => r.id === Number(form.raceId));
    if (!race) return;
    try {
      await refereeReportService.create({
        raceId: race.id,
        raceName: race.name,
        refereeId: user.userId,
        refereeName: user.fullName,
        content: form.content,
      });
      setToast({ message: 'Đã gửi báo cáo.', variant: 'success' });
      setForm({ raceId: '', content: '' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Gửi báo cáo thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'raceName', label: 'Race' },
    { key: 'content', label: 'Nội dung' },
    { key: 'createdAt', label: 'Ngày tạo', render: (r) => formatDate(r.createdAt) },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header"><h2>Báo cáo vi phạm</h2></div>

      <Form onSubmit={handleCreate} className="dash-card d-flex flex-wrap gap-3 align-items-end mb-4">
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Race</Form.Label>
          <Form.Select value={form.raceId} onChange={(e) => setForm({ ...form, raceId: e.target.value })} required>
            <option value="">-- Chọn race --</option>
            {races.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group style={{ flex: 1, minWidth: 260 }}>
          <Form.Label style={{ color: '#D4AF37' }}>Nội dung</Form.Label>
          <Form.Control value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
        </Form.Group>
        <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px' }}>Gửi báo cáo</Button>
      </Form>

      {reports.length === 0 ? <EmptyState message="Chưa có báo cáo nào." /> : <DataTable columns={columns} rows={reports} />}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
