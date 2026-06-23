import { useEffect, useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { prizeService } from '../../services/prizeService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';

const EMPTY_FORM = { raceId: '', position: '', amount: '', score: '' };

export default function PrizesPage() {
  const [prizes, setPrizes] = useState([]);
  const [races, setRaces] = useState([]);
  const [filterRaceId, setFilterRaceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({ position: '', amount: '', score: '' });

  const load = () => {
    Promise.all([prizeService.getAll(), raceService.getAll()])
      .then(([p, r]) => { setPrizes(p); setRaces(r); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu giải thưởng.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await prizeService.create({
        raceId: Number(form.raceId),
        position: Number(form.position),
        amount: parseFloat(form.amount),
        score: form.score ? parseFloat(form.score) : 0,
      });
      setToast({ message: 'Tạo giải thưởng thành công.', variant: 'success' });
      setForm(EMPTY_FORM);
      setShowCreate(false);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo thất bại.'), variant: 'danger' });
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditForm({ position: String(row.position), amount: String(row.amount), score: String(row.score ?? 0) });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await prizeService.update(editRow.id, {
        raceId: editRow.raceId,
        position: Number(editForm.position),
        amount: parseFloat(editForm.amount),
        score: parseFloat(editForm.score) || 0,
      });
      setToast({ message: 'Cập nhật thành công.', variant: 'success' });
      setEditRow(null);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá giải thưởng này?')) return;
    try {
      await prizeService.remove(id);
      setToast({ message: 'Đã xoá.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Xoá thất bại.'), variant: 'danger' });
    }
  };

  const raceName = (id) => races.find((r) => r.id === id)?.name ?? `Race #${id}`;

  const displayed = filterRaceId
    ? prizes.filter((p) => p.raceId === Number(filterRaceId))
    : prizes;

  const columns = [
    { key: 'raceName', label: 'Race', render: (p) => p.raceName ?? raceName(p.raceId) },
    { key: 'position', label: 'Hạng', render: (p) => `#${p.position}` },
    { key: 'amount', label: 'Tiền thưởng', render: (p) => `$${(p.amount ?? 0).toLocaleString()}` },
    { key: 'score', label: 'Điểm', render: (p) => p.score ?? 0 },
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

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <h2>Cơ cấu giải thưởng</h2>
        <Button className="btn-gold-sm" onClick={() => setShowCreate(true)}>+ Thêm giải thưởng</Button>
      </div>

      {/* Filter by race */}
      <div className="dash-card mb-4">
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Lọc theo Race</Form.Label>
          <Form.Select value={filterRaceId} onChange={(e) => setFilterRaceId(e.target.value)} style={{ maxWidth: 320 }}>
            <option value="">-- Tất cả race --</option>
            {races.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Form.Select>
        </Form.Group>
      </div>

      {displayed.length === 0
        ? <EmptyState message="Chưa có giải thưởng nào." />
        : <DataTable columns={columns} rows={displayed} />}

      {/* Create Modal */}
      <Modal show={showCreate} onHide={() => { setShowCreate(false); setForm(EMPTY_FORM); }} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Thêm giải thưởng</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <Form onSubmit={handleCreate} className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Race <span style={{ color: '#e55' }}>*</span></Form.Label>
              <Form.Select value={form.raceId} onChange={(e) => setForm({ ...form, raceId: e.target.value })} required>
                <option value="">-- Chọn race --</option>
                {races.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Hạng (position) <span style={{ color: '#e55' }}>*</span></Form.Label>
              <Form.Control type="number" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required min="1" placeholder="VD: 1" />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Tiền thưởng ($) <span style={{ color: '#e55' }}>*</span></Form.Label>
              <Form.Control type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="0" placeholder="VD: 50000" />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Điểm (score)</Form.Label>
              <Form.Control type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} min="0" placeholder="VD: 10" />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-2">
              <Button variant="secondary" onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); }}>Huỷ</Button>
              <Button type="submit" className="btn-gold-sm">Tạo</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={!!editRow} onHide={() => setEditRow(null)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Sửa giải thưởng — {editRow && raceName(editRow.raceId)}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <Form onSubmit={handleUpdate} className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Hạng</Form.Label>
              <Form.Control type="number" value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} required min="1" />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Tiền thưởng ($)</Form.Label>
              <Form.Control type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} required min="0" />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Điểm</Form.Label>
              <Form.Control type="number" value={editForm.score} onChange={(e) => setEditForm({ ...editForm, score: e.target.value })} min="0" />
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
