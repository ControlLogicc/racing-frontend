import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Modal } from 'react-bootstrap';
import { racecourseService } from '../../services/racecourseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';

const SURFACE_TYPES = ['turf', 'dirt', 'synthetic', 'all-weather'];

const EMPTY_FORM = { name: '', location: '', surfaceType: 'turf', capacity: '' };

const CourseForm = ({ values, onChange, onSubmit, onCancel, submitLabel }) => (
  <Form onSubmit={onSubmit} className="d-flex flex-column gap-3">
    <Form.Group>
      <Form.Label style={{ color: '#D4AF37' }}>Tên đường đua <span style={{ color: '#e55' }}>*</span></Form.Label>
      <Form.Control value={values.name} onChange={(e) => onChange({ ...values, name: e.target.value })} required />
    </Form.Group>
    <Form.Group>
      <Form.Label style={{ color: '#D4AF37' }}>Địa điểm</Form.Label>
      <Form.Control value={values.location} onChange={(e) => onChange({ ...values, location: e.target.value })} placeholder="VD: Thành phố Hồ Chí Minh" />
    </Form.Group>
    <Form.Group>
      <Form.Label style={{ color: '#D4AF37' }}>Loại mặt đường</Form.Label>
      <Form.Select value={values.surfaceType} onChange={(e) => onChange({ ...values, surfaceType: e.target.value })}>
        {SURFACE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </Form.Select>
    </Form.Group>
    <Form.Group>
      <Form.Label style={{ color: '#D4AF37' }}>Sức chứa (người)</Form.Label>
      <Form.Control type="number" value={values.capacity} onChange={(e) => onChange({ ...values, capacity: e.target.value })} min="0" placeholder="VD: 10000" />
    </Form.Group>
    <div className="d-flex justify-content-end gap-2 mt-2">
      <Button variant="secondary" onClick={onCancel}>Huỷ</Button>
      <Button type="submit" className="btn-gold-sm">{submitLabel}</Button>
    </div>
  </Form>
);

export default function RacecoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const load = () => {
    racecourseService
      .getAll()
      .then(setCourses)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách đường đua.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  // eslint-disable-next-line no-unused-vars
  const openEdit = (row) => {
    setEditRow(row);
    setEditForm({ name: row.racecourseName ?? '', location: row.location ?? '', surfaceType: row.surfaceType ?? 'turf', capacity: String(row.capacity ?? '') });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await racecourseService.update(editRow.id, editForm);
      setToast({ message: 'Cập nhật thành công.', variant: 'success' });
      setEditRow(null);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá đường đua này?')) return;
    try {
      await racecourseService.remove(id);
      setToast({ message: 'Đã xoá.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Xoá thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'racecourseId', label: 'ID' },
    { key: 'racecourseName', label: 'Tên đường đua' },
    { key: 'location', label: 'Địa điểm', render: (r) => r.location ?? '—' },
    { key: 'surfaceType', label: 'Loại mặt đường', render: (r) => r.surfaceType ?? '—' },
    { key: 'capacity', label: 'Sức chứa', render: (r) => r.capacity ? r.capacity.toLocaleString() : '—' },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => (
        <div className="d-flex gap-2">
          <button className="btn-gold-sm" onClick={() => navigate(`/admin/racecourses/${row.id}/edit`)}>Sửa</button>
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
        <h2>Quản lý Đường đua (Racecourse)</h2>
        <Button className="btn-gold-sm" onClick={() => navigate('/admin/racecourses/create')}>+ Thêm đường đua</Button>
      </div>

      {courses.length === 0
        ? <EmptyState message="Chưa có đường đua nào. Cần tạo đường đua trước khi tạo Meeting." />
        : <DataTable columns={columns} rows={courses} />}

      <Modal show={!!editRow} onHide={() => setEditRow(null)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Sửa đường đua</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <CourseForm values={editForm} onChange={setEditForm} onSubmit={handleUpdate} onCancel={() => setEditRow(null)} submitLabel="Lưu" />
        </Modal.Body>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
