import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Modal } from 'react-bootstrap';
import { raceService } from '../../services/raceService';
import { meetingService } from '../../services/meetingService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';

const PAGE_SIZE = 10;
const EMPTY_FORM = { meetingId: '', name: '', distance: '', raceTime: '' };

export default function RacesPage() {
  const [races, setRaces] = useState([]);
  const [meetings, setMeetings] = useState([]);
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
    Promise.all([raceService.getAll(), meetingService.getAll()])
      .then(([r, m]) => { setRaces(r); setMeetings(m); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách race.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (editRow) {
      resetEdit({
        meetingId: String(editRow.meetingId),
        name: editRow.name,
        distance: String(editRow.distance),
        raceTime: editRow.raceTime ? editRow.raceTime.slice(0, 16) : '',
      });
    }
  }, [editRow, resetEdit]);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const onCreate = async (data) => {
    try {
      await raceService.create({ ...data, meetingId: Number(data.meetingId), distance: Number(data.distance) });
      setToast({ message: 'Tạo race thành công.', variant: 'success' });
      resetCreate(EMPTY_FORM);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo race thất bại.'), variant: 'danger' });
    }
  };

  const onUpdate = async (data) => {
    try {
      await raceService.update(editRow.id, {
        ...data,
        meetingId: Number(data.meetingId),
        distance: Number(data.distance),
      });
      setToast({ message: 'Cập nhật race thành công.', variant: 'success' });
      setEditRow(null);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá race này?')) return;
    try {
      await raceService.remove(id);
      setToast({ message: 'Đã xoá race.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Xoá thất bại.'), variant: 'danger' });
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await raceService.setStatus(id, status);
      setToast({ message: 'Cập nhật trạng thái race thành công.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    }
  };

  const meetingName = (id) => meetings.find((m) => m.id === id)?.name ?? id;

  const columns = [
    { key: 'name', label: 'Tên race' },
    { key: 'meetingId', label: 'Meeting', render: (r) => meetingName(r.meetingId) },
    { key: 'distance', label: 'Cự ly (m)' },
    { key: 'raceTime', label: 'Giờ đua', render: (r) => formatDate(r.raceTime) },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'statusAction',
      label: 'Đổi trạng thái',
      render: (r) => (
        <Form.Select size="sm" value={r.status} style={{ maxWidth: 160 }} onChange={(e) => handleStatusChange(r.id, e.target.value)}>
          {Object.values(RACE_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
        </Form.Select>
      ),
    },
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
  const pageRows = races.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-header"><h2>Quản lý Race</h2></div>

      <Form onSubmit={submitCreate(onCreate)} className="dash-card d-flex flex-wrap gap-3 align-items-start mb-4" noValidate>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Meeting</Form.Label>
          <Form.Select
            {...regCreate('meetingId', { required: 'Chọn meeting' })}
            isInvalid={!!createErrors.meetingId}
          >
            <option value="">-- Chọn meeting --</option>
            {meetings.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{createErrors.meetingId?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Tên race</Form.Label>
          <Form.Control
            {...regCreate('name', { required: 'Tên race là bắt buộc' })}
            isInvalid={!!createErrors.name}
          />
          <Form.Control.Feedback type="invalid">{createErrors.name?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Cự ly (m)</Form.Label>
          <Form.Control
            type="number"
            {...regCreate('distance', { required: 'Cự ly là bắt buộc', min: { value: 1, message: 'Cự ly phải lớn hơn 0' } })}
            isInvalid={!!createErrors.distance}
          />
          <Form.Control.Feedback type="invalid">{createErrors.distance?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Giờ đua</Form.Label>
          <Form.Control
            type="datetime-local"
            {...regCreate('raceTime', { required: 'Giờ đua là bắt buộc' })}
            isInvalid={!!createErrors.raceTime}
          />
          <Form.Control.Feedback type="invalid">{createErrors.raceTime?.message}</Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px', marginTop: '32px' }}>
          Tạo Race
        </Button>
      </Form>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && races.length === 0 && <EmptyState message="Chưa có race nào." />}
      {!loading && !error && races.length > 0 && (
        <>
          <DataTable columns={columns} rows={pageRows} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={races.length} onPageChange={setPage} />
        </>
      )}

      <Modal show={!!editRow} onHide={() => setEditRow(null)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Sửa Race</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <Form onSubmit={submitEdit(onUpdate)} className="d-flex flex-column gap-3" noValidate>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Meeting</Form.Label>
              <Form.Select
                {...regEdit('meetingId', { required: 'Chọn meeting' })}
                isInvalid={!!editErrors.meetingId}
              >
                <option value="">-- Chọn meeting --</option>
                {meetings.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{editErrors.meetingId?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Tên race</Form.Label>
              <Form.Control
                {...regEdit('name', { required: 'Tên race là bắt buộc' })}
                isInvalid={!!editErrors.name}
              />
              <Form.Control.Feedback type="invalid">{editErrors.name?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Cự ly (m)</Form.Label>
              <Form.Control
                type="number"
                {...regEdit('distance', { required: 'Cự ly là bắt buộc', min: { value: 1, message: 'Cự ly phải lớn hơn 0' } })}
                isInvalid={!!editErrors.distance}
              />
              <Form.Control.Feedback type="invalid">{editErrors.distance?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Giờ đua</Form.Label>
              <Form.Control
                type="datetime-local"
                {...regEdit('raceTime', { required: 'Giờ đua là bắt buộc' })}
                isInvalid={!!editErrors.raceTime}
              />
              <Form.Control.Feedback type="invalid">{editErrors.raceTime?.message}</Form.Control.Feedback>
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
