import { useEffect, useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { seasonService } from '../../services/seasonService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';

const EMPTY_FORM = { name: '', startDate: '', endDate: '', status: 'open' };

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const load = () => {
    seasonService
      .getAll()
      .then(setSeasons)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách season.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await seasonService.create(form);
      setToast({ message: 'Tạo season thành công.', variant: 'success' });
      setForm(EMPTY_FORM);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo season thất bại.'), variant: 'danger' });
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditForm({ name: row.name, startDate: row.startDate, endDate: row.endDate, status: row.status ?? 'open' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await seasonService.update(editRow.id, editForm);
      setToast({ message: 'Cập nhật season thành công.', variant: 'success' });
      setEditRow(null);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá season này?')) return;
    try {
      await seasonService.remove(id);
      setToast({ message: 'Đã xoá season.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Xoá thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'name', label: 'Tên mùa giải' },
    { key: 'startDate', label: 'Bắt đầu' },
    { key: 'endDate', label: 'Kết thúc' },
    { key: 'status', label: 'Trạng thái' },
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

      {/* Edit Modal */}
      <Modal show={!!editRow} onHide={() => setEditRow(null)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Sửa Season</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <Form onSubmit={handleUpdate} className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Tên mùa giải</Form.Label>
              <Form.Control value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Bắt đầu</Form.Label>
              <Form.Control type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} required />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Kết thúc</Form.Label>
              <Form.Control type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} required />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Trạng thái</Form.Label>
              <Form.Select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </Form.Select>
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
