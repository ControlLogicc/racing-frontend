import { useEffect, useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
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
const EMPTY_FORM = { seasonId: '', name: '', racecourse: '', date: '' };

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const load = () => {
    Promise.all([meetingService.getAll(), seasonService.getAll()])
      .then(([m, s]) => { setMeetings(m); setSeasons(s); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách meeting.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await meetingService.create({ ...form, seasonId: Number(form.seasonId) });
      setToast({ message: 'Tạo meeting thành công.', variant: 'success' });
      setForm(EMPTY_FORM);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo meeting thất bại.'), variant: 'danger' });
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditForm({
      seasonId: String(row.seasonId),
      name: row.name,
      racecourse: row.racecourse,
      date: row.date ? row.date.slice(0, 16) : '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await meetingService.update(editRow.id, { ...editForm, seasonId: Number(editForm.seasonId) });
      setToast({ message: 'Cập nhật meeting thành công.', variant: 'success' });
      setEditRow(null);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá meeting này?')) return;
    try {
      await meetingService.remove(id);
      setToast({ message: 'Đã xoá meeting.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Xoá thất bại.'), variant: 'danger' });
    }
  };

  const seasonName = (id) => seasons.find((s) => s.id === id)?.name ?? id;

  const columns = [
    { key: 'name', label: 'Tên meeting' },
    { key: 'seasonId', label: 'Season', render: (r) => seasonName(r.seasonId) },
    { key: 'racecourse', label: 'Đường đua' },
    { key: 'date', label: 'Ngày', render: (r) => formatDate(r.date) },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => (
        <div className="d-flex gap-2">
          <button className="btn-gold-sm" onClick={() => openEdit(row)}>Sửa</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>Xoá</button>
        </div>
      ),
    },
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

      {/* Edit Modal */}
      <Modal show={!!editRow} onHide={() => setEditRow(null)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Sửa Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <Form onSubmit={handleUpdate} className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Season</Form.Label>
              <Form.Select value={editForm.seasonId} onChange={(e) => setEditForm({ ...editForm, seasonId: e.target.value })} required>
                <option value="">-- Chọn season --</option>
                {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Tên meeting</Form.Label>
              <Form.Control value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Đường đua</Form.Label>
              <Form.Control value={editForm.racecourse} onChange={(e) => setEditForm({ ...editForm, racecourse: e.target.value })} required />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Ngày</Form.Label>
              <Form.Control type="datetime-local" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} required />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-2">
              <Button variant="secondary" onClick={() => setEditRow(null)}>Huỷ</Button>
              <Button type="submit" className="btn-gold-sm">Lưu</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
