import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
  const [editRow, setEditRow] = useState(null);

  const {
    register: regCreate,
    handleSubmit: submitCreate,
    formState: { errors: createErrors },
    reset: resetCreate,
  } = useForm({ defaultValues: EMPTY_FORM });

  const {
    register: regEdit,
    handleSubmit: submitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
  } = useForm();

  const load = () => {
    Promise.all([meetingService.getAll(), seasonService.getAll()])
      .then(([m, s]) => { setMeetings(m); setSeasons(s); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách meeting.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (editRow) {
      resetEdit({
        seasonId: String(editRow.seasonId),
        name: editRow.name,
        racecourse: editRow.racecourse,
        date: editRow.date ? editRow.date.slice(0, 16) : '',
      });
    }
  }, [editRow, resetEdit]);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const onCreate = async (data) => {
    try {
      await meetingService.create({ ...data, seasonId: Number(data.seasonId) });
      setToast({ message: 'Tạo meeting thành công.', variant: 'success' });
      resetCreate(EMPTY_FORM);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo meeting thất bại.'), variant: 'danger' });
    }
  };

  const onUpdate = async (data) => {
    try {
      await meetingService.update(editRow.id, { ...data, seasonId: Number(data.seasonId) });
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
          <button className="btn-gold-sm" onClick={() => setEditRow(row)}>Sửa</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>Xoá</button>
        </div>
      ),
    },
  ];
  const pageRows = meetings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-header"><h2>Quản lý Meeting</h2></div>

      <Form onSubmit={submitCreate(onCreate)} className="dash-card d-flex flex-wrap gap-3 align-items-start mb-4" noValidate>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Season</Form.Label>
          <Form.Select
            {...regCreate('seasonId', { required: 'Chọn season' })}
            isInvalid={!!createErrors.seasonId}
          >
            <option value="">-- Chọn season --</option>
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{createErrors.seasonId?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Tên meeting</Form.Label>
          <Form.Control
            {...regCreate('name', { required: 'Tên meeting là bắt buộc' })}
            isInvalid={!!createErrors.name}
          />
          <Form.Control.Feedback type="invalid">{createErrors.name?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Đường đua</Form.Label>
          <Form.Control
            {...regCreate('racecourse', { required: 'Đường đua là bắt buộc' })}
            isInvalid={!!createErrors.racecourse}
          />
          <Form.Control.Feedback type="invalid">{createErrors.racecourse?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Ngày</Form.Label>
          <Form.Control
            type="datetime-local"
            {...regCreate('date', { required: 'Ngày là bắt buộc' })}
            isInvalid={!!createErrors.date}
          />
          <Form.Control.Feedback type="invalid">{createErrors.date?.message}</Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px', marginTop: '32px' }}>
          Tạo Meeting
        </Button>
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

      <Modal show={!!editRow} onHide={() => setEditRow(null)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Sửa Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <Form onSubmit={submitEdit(onUpdate)} className="d-flex flex-column gap-3" noValidate>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Season</Form.Label>
              <Form.Select
                {...regEdit('seasonId', { required: 'Chọn season' })}
                isInvalid={!!editErrors.seasonId}
              >
                <option value="">-- Chọn season --</option>
                {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{editErrors.seasonId?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Tên meeting</Form.Label>
              <Form.Control
                {...regEdit('name', { required: 'Tên meeting là bắt buộc' })}
                isInvalid={!!editErrors.name}
              />
              <Form.Control.Feedback type="invalid">{editErrors.name?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Đường đua</Form.Label>
              <Form.Control
                {...regEdit('racecourse', { required: 'Đường đua là bắt buộc' })}
                isInvalid={!!editErrors.racecourse}
              />
              <Form.Control.Feedback type="invalid">{editErrors.racecourse?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Ngày</Form.Label>
              <Form.Control
                type="datetime-local"
                {...regEdit('date', { required: 'Ngày là bắt buộc' })}
                isInvalid={!!editErrors.date}
              />
              <Form.Control.Feedback type="invalid">{editErrors.date?.message}</Form.Control.Feedback>
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
