import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Modal, Dropdown } from 'react-bootstrap';
import { raceConditionService } from '../../services/raceConditionService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

const TRACK_TYPES = ['turf', 'dirt', 'synthetic'];
const CLASS_OPTIONS = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
const EMPTY_FORM = { conditionName: '', distance: '', trackType: 'turf', minEntries: '', maxEntries: '', classRequirement: '' };

export default function RaceConditionsPage() {
  const navigate = useNavigate();
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const load = () => {
    raceConditionService
      .getAll()
      .then(setConditions)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách condition.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const openEdit = (row) => {
    setEditRow(row);
    setEditForm({
      conditionName: row.conditionName ?? '',
      distance: String(row.distance ?? ''),
      trackType: row.trackType ?? 'turf',
      minEntries: String(row.minEntries ?? ''),
      maxEntries: String(row.maxEntries ?? ''),
      classRequirement: row.classRequirement ?? '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.conditionName.trim() || !editForm.distance) {
      setToast({ message: 'Vui lòng nhập tên condition và cự ly.', variant: 'warning' });
      return;
    }
    try {
      await raceConditionService.update(editRow.id, {
        conditionName: editForm.conditionName.trim(),
        distance: Number(editForm.distance),
        trackType: editForm.trackType,
        minEntries: editForm.minEntries ? Number(editForm.minEntries) : null,
        maxEntries: editForm.maxEntries ? Number(editForm.maxEntries) : null,
        classRequirement: editForm.classRequirement || null,
      });
      setToast({ message: 'Cập nhật thành công.', variant: 'success' });
      setEditRow(null);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá condition này?')) return;
    try {
      await raceConditionService.remove(id);
      setToast({ message: 'Đã xoá condition.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Xoá thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'conditionId', label: 'ID' },
    { key: 'conditionName', label: 'Tên Condition' },
    { key: 'distance', label: 'Cự ly (m)' },
    { key: 'trackType', label: 'Đường đua' },
    { key: 'minEntries', label: 'Tối thiểu' },
    { key: 'maxEntries', label: 'Tối đa' },
    { key: 'classRequirement', label: 'Hạng yêu cầu', render: (r) => r.classRequirement ?? '-' },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => (
        <div className="d-flex gap-2">
          <button className="btn-gold-sm" onClick={() => navigate(`/admin/race-conditions/${row.id}/edit`)}>Sửa</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>Xoá</button>
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="season-admin-page">
      <section className="season-list-section">
        <div className="page-header">
          <h2>Danh sách Race Condition</h2>
          <Button className="season-create-toggle" onClick={() => navigate('/admin/race-conditions/create')}>
            + Tạo Condition
          </Button>
        </div>

        {conditions.length === 0
          ? <EmptyState message="Chưa có condition nào. Condition được dùng khi tạo Race." />
          : <DataTable columns={columns} rows={conditions} />}
      </section>

      <Modal show={!!editRow} onHide={() => setEditRow(null)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Sửa Condition</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <Form onSubmit={handleUpdate} className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Tên condition</Form.Label>
              <Form.Control value={editForm.conditionName} onChange={(e) => setEditForm({ ...editForm, conditionName: e.target.value })} required />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Cự ly (m)</Form.Label>
              <Form.Control type="number" value={editForm.distance} onChange={(e) => setEditForm({ ...editForm, distance: e.target.value })} required />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Loại đường đua</Form.Label>
              <Form.Select value={editForm.trackType} onChange={(e) => setEditForm({ ...editForm, trackType: e.target.value })}>
                {TRACK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Form.Group>
            <div className="d-flex gap-3">
              <Form.Group style={{ flex: 1 }}>
                <Form.Label style={{ color: '#D4AF37' }}>Số ngựa tối thiểu</Form.Label>
                <Form.Control type="number" value={editForm.minEntries} onChange={(e) => setEditForm({ ...editForm, minEntries: e.target.value })} min="8" max="14" />
              </Form.Group>
              <Form.Group style={{ flex: 1 }}>
                <Form.Label style={{ color: '#D4AF37' }}>Số ngựa tối đa</Form.Label>
                <Form.Control type="number" value={editForm.maxEntries} onChange={(e) => setEditForm({ ...editForm, maxEntries: e.target.value })} min="8" max="14" />
              </Form.Group>
            </div>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Hạng yêu cầu</Form.Label>
              <Dropdown className="condition-class-dropdown" drop="down">
                <Dropdown.Toggle type="button" className="condition-class-toggle">
                  {editForm.classRequirement || '-- Chọn class --'}
                </Dropdown.Toggle>
                <Dropdown.Menu className="condition-class-menu" popperConfig={{ modifiers: [{ name: 'flip', enabled: false }] }}>
                  {CLASS_OPTIONS.map((option) => (
                    <Dropdown.Item key={option} active={editForm.classRequirement === option} onClick={() => setEditForm({ ...editForm, classRequirement: option })}>
                      {option}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
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
