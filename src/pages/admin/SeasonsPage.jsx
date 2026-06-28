import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Modal } from 'react-bootstrap';
import { seasonService } from '../../services/seasonService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

export default function SeasonsPage() {
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [editRow, setEditRow] = useState(null);

  const {
    register: regEdit,
    handleSubmit: submitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
  } = useForm();

  const load = () => {
    seasonService
      .getAll()
      .then(setSeasons)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách season.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (editRow) {
      resetEdit({
        name: editRow.name,
        startDate: editRow.startDate ? editRow.startDate.slice(0, 10) : '',
        endDate: editRow.endDate ? editRow.endDate.slice(0, 10) : '',
        status: String(editRow.status ?? 'active').toLowerCase(),
      });
    }
  }, [editRow, resetEdit]);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const onUpdate = async (data) => {
    try {
      await seasonService.update(editRow.id, data);
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
          <button className="btn-gold-sm" onClick={() => navigate(`/admin/seasons/${row.id}/edit`)}>Sửa</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>Xoá</button>
        </div>
      ),
    },
  ];

  return (
    <div className="season-admin-page">
      <section className="season-list-section">
        <div className="page-header">
          <h2>Danh sách Season</h2>
          <Button
            type="button"
            className="season-create-toggle"
            onClick={() => navigate('/admin/seasons/create')}
          >
            + Tạo Season
          </Button>
        </div>
        {loading && <Loading />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && seasons.length === 0 && <EmptyState message="Chưa có season nào." />}
        {!loading && !error && seasons.length > 0 && <DataTable columns={columns} rows={seasons} />}
      </section>

      <Modal show={!!editRow} onHide={() => setEditRow(null)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Sửa Season</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <Form onSubmit={submitEdit(onUpdate)} className="d-flex flex-column gap-3" noValidate>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Tên mùa giải</Form.Label>
              <Form.Control
                {...regEdit('name', { required: 'Tên mùa giải là bắt buộc' })}
                isInvalid={!!editErrors.name}
              />
              <Form.Control.Feedback type="invalid">{editErrors.name?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Bắt đầu</Form.Label>
              <Form.Control
                type="date"
                {...regEdit('startDate', { required: 'Ngày bắt đầu là bắt buộc' })}
                isInvalid={!!editErrors.startDate}
              />
              <Form.Control.Feedback type="invalid">{editErrors.startDate?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Kết thúc</Form.Label>
              <Form.Control
                type="date"
                {...regEdit('endDate', { required: 'Ngày kết thúc là bắt buộc' })}
                isInvalid={!!editErrors.endDate}
              />
              <Form.Control.Feedback type="invalid">{editErrors.endDate?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Trạng thái</Form.Label>
              <Form.Select {...regEdit('status', { required: true })}>
                <option value="active">Active (Đang hoạt động)</option>
                <option value="draft">Draft (Bản nháp)</option>
                <option value="completed">Completed (Đã kết thúc)</option>
                <option value="cancelled">Cancelled (Đã huỷ)</option>
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
