import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Modal } from 'react-bootstrap';
import { raceService } from '../../services/raceService';
import { meetingService } from '../../services/meetingService';
import { raceConditionService } from '../../services/raceConditionService';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';
import { RACE_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

const PAGE_SIZE = 10;
const RACE_STATUS_FLOW = [
  RACE_STATUS.DRAFT,
  RACE_STATUS.SCHEDULED,
  RACE_STATUS.OPEN_FOR_ENTRY,
  RACE_STATUS.CLOSED_FOR_ENTRY,
  RACE_STATUS.RUNNING,
  RACE_STATUS.RESULT_PENDING,
  RACE_STATUS.OFFICIAL,
  RACE_STATUS.CANCELLED,
];

const statusStep = (status) => {
  const index = RACE_STATUS_FLOW.indexOf(status);
  return index >= 0 ? index : 0;
};

function RaceFormFields({ reg, errs, meetings: mtgs, conditions: conds, staff: slist, referees: rlist, loading }) {
  return (
    <>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Meeting <span style={{ color: '#e55' }}>*</span></Form.Label>
        <Form.Select {...reg('meetingId', { required: 'Chọn meeting' })} isInvalid={!!errs.meetingId}>
          <option value="">-- Chọn meeting --</option>
          {mtgs.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </Form.Select>
        <Form.Control.Feedback type="invalid">{errs.meetingId?.message}</Form.Control.Feedback>
        {mtgs.length === 0 && !loading && <Form.Text style={{ color: '#888' }}>Chưa có meeting nào.</Form.Text>}
      </Form.Group>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Condition</Form.Label>
        <Form.Select {...reg('conditionId')}>
          <option value="">-- Chọn condition --</option>
          {conds.map((c) => <option key={c.id} value={c.id}>{c.conditionName} ({c.distance}m)</option>)}
        </Form.Select>
      </Form.Group>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Staff phụ trách</Form.Label>
        <Form.Select {...reg('staffId')}>
          <option value="">-- Chọn staff --</option>
          {slist.map((s) => <option key={s.staffId} value={s.staffId}>{s.fullName}</option>)}
        </Form.Select>
      </Form.Group>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Referee phụ trách</Form.Label>
        <Form.Select {...reg('refereeId')}>
          <option value="">-- Chọn referee --</option>
          {rlist.map((r) => <option key={r.refereeId} value={r.refereeId}>{r.fullName}</option>)}
        </Form.Select>
      </Form.Group>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Số thứ tự</Form.Label>
        <Form.Control type="number" {...reg('raceNo')} min="1" />
      </Form.Group>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Tên race <span style={{ color: '#e55' }}>*</span></Form.Label>
        <Form.Control {...reg('name', { required: 'Tên race là bắt buộc' })} isInvalid={!!errs.name} />
        <Form.Control.Feedback type="invalid">{errs.name?.message}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Giờ đua <span style={{ color: '#e55' }}>*</span></Form.Label>
        <Form.Control type="datetime-local" {...reg('raceTime', { required: 'Giờ đua là bắt buộc' })} isInvalid={!!errs.raceTime} />
        <Form.Control.Feedback type="invalid">{errs.raceTime?.message}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Mở đăng ký <span style={{ color: '#e55' }}>*</span></Form.Label>
        <Form.Control type="datetime-local" {...reg('registrationOpenAt', { 
          required: 'Ngày mở đăng ký là bắt buộc',
          validate: (val, formValues) => {
            if (formValues.raceTime && new Date(val) >= new Date(formValues.raceTime)) return 'Phải mở trước giờ đua';
            return true;
          }
        })} isInvalid={!!errs.registrationOpenAt} />
        <Form.Control.Feedback type="invalid">{errs.registrationOpenAt?.message}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Đóng đăng ký <span style={{ color: '#e55' }}>*</span></Form.Label>
        <Form.Control type="datetime-local" {...reg('registrationCloseAt', { 
          required: 'Thời hạn đăng ký là bắt buộc',
          validate: (val, formValues) => {
            if (formValues.raceTime && new Date(val) >= new Date(formValues.raceTime)) return 'Phải đóng trước giờ đua';
            if (formValues.registrationOpenAt && new Date(val) <= new Date(formValues.registrationOpenAt)) return 'Phải đóng sau khi mở';
            return true;
          }
        })} isInvalid={!!errs.registrationCloseAt} />
        <Form.Control.Feedback type="invalid">{errs.registrationCloseAt?.message}</Form.Control.Feedback>
      </Form.Group>
    </>
  );
}

export default function RacesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [races, setRaces] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [refereeList, setRefereeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [editRow, setEditRow] = useState(null);

  const {
    register: regEdit,
    handleSubmit: submitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
  } = useForm();

  const load = () => {
    Promise.all([
      raceService.getAll(),
      meetingService.getAll(),
      raceConditionService.getAll(),
      userService.getStaff(),
      userService.getReferees(),
    ])
      .then(([r, m, c, staff, referees]) => {
        setRaces(r); setMeetings(m); setConditions(c);
        setStaffList(staff); setRefereeList(referees);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách race.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (editRow) {
      resetEdit({
        meetingId: String(editRow.meetingId ?? ''),
        conditionId: String(editRow.conditionId ?? ''),
        name: editRow.name ?? '',
        raceNo: String(editRow.raceNo ?? ''),
        raceTime: editRow.raceTime ? editRow.raceTime.slice(0, 16) : '',
        registrationOpenAt: editRow.registrationOpenAt ? editRow.registrationOpenAt.slice(0, 16) : '',
        registrationCloseAt: editRow.registrationCloseAt ? editRow.registrationCloseAt.slice(0, 16) : '',
        staffId: editRow.staffId ? String(editRow.staffId) : '',
        refereeId: editRow.refereeId ? String(editRow.refereeId) : '',
      });
    }
  }, [editRow, resetEdit]);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const onUpdate = async (data) => {
    try {
      await raceService.update(editRow.id, {
        ...data,
        meetingId: Number(data.meetingId),
        conditionId: data.conditionId ? Number(data.conditionId) : undefined,
        raceNo: data.raceNo ? Number(data.raceNo) : undefined,
        status: editRow.status,
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
      const raceToUpdate = races.find((r) => r.id === id);
      if (!raceToUpdate) throw new Error('Race not found in local state.');
      if (statusStep(status) < statusStep(raceToUpdate.status)) {
        setToast({ message: 'Không thể quay lại trạng thái trước đó.', variant: 'warning' });
        return;
      }
      let payload = { ...raceToUpdate, status };
      if (status === RACE_STATUS.OPEN_FOR_ENTRY && !payload.registrationOpenAt) {
        payload = { ...payload, registrationOpenAt: new Date().toISOString() };
      }
      await raceService.update(id, payload);
      setToast({ message: 'Cập nhật trạng thái race thành công.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    }
  };

  const meetingName = (id) => meetings.find((m) => m.id === id)?.name ?? id;
  const conditionName = (id) => conditions.find((c) => c.id === id)?.conditionName ?? '-';

  const columns = [
    { key: 'raceNo', label: '#', render: (r) => r.raceNo ?? '-' },
    { key: 'name', label: 'Tên race' },
    { key: 'meetingId', label: 'Meeting', render: (r) => meetingName(r.meetingId) },
    { key: 'conditionId', label: 'Condition', render: (r) => conditionName(r.conditionId) },
    { key: 'raceTime', label: 'Giờ đua', render: (r) => formatDate(r.raceTime) },
    { key: 'registrationOpenAt', label: 'Mở ĐK', render: (r) => r.registrationOpenAt ? formatDate(r.registrationOpenAt) : '-' },
    { key: 'registrationCloseAt', label: 'Đóng ĐK', render: (r) => r.registrationCloseAt ? formatDate(r.registrationCloseAt) : '-' },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'statusAction',
      label: 'Đổi trạng thái',
      render: (r) => (
        <Form.Select size="sm" value={r.status} style={{ maxWidth: 160 }} onChange={(e) => handleStatusChange(r.id, e.target.value)}>
          {RACE_STATUS_FLOW.map((s) => (
            <option key={s} value={s} disabled={statusStep(s) < statusStep(r.status)}>{s}</option>
          ))}
        </Form.Select>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => {
        const isStaff = user?.role?.toLowerCase() === 'staff';
        return (
          <div className="d-flex gap-2 flex-wrap">
            {!isStaff && <button className="btn-gold-sm" onClick={() => navigate(`/admin/races/${row.id}/edit`)}>Sửa</button>}
            {!isStaff && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>Xoá</button>}
          </div>
        );
      },
    },
  ];
  const pageRows = races.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="season-admin-page">
      <section className="season-list-section">
        <div className="page-header">
          <h2>Danh sách Race</h2>
          {user?.role?.toLowerCase() !== 'staff' && (
            <Button className="season-create-toggle" onClick={() => navigate('/admin/races/create')}>
              + Tạo Race
            </Button>
          )}
        </div>

        {loading && <Loading />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && races.length === 0 && <EmptyState message="Chưa có race nào." />}
        {!loading && !error && races.length > 0 && (
          <>
            <DataTable columns={columns} rows={pageRows} />
            <Pagination page={page} pageSize={PAGE_SIZE} total={races.length} onPageChange={setPage} />
          </>
        )}
      </section>

      <Modal show={!!editRow} onHide={() => setEditRow(null)} centered size="lg">
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Sửa Race</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <Form onSubmit={submitEdit(onUpdate)} className="d-flex flex-column gap-3" noValidate>
            <RaceFormFields reg={regEdit} errs={editErrors} meetings={meetings} conditions={conditions} staff={staffList} referees={refereeList} loading={loading} />
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
