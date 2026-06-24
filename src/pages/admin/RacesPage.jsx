import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Modal } from 'react-bootstrap';
import { raceService } from '../../services/raceService';
import { meetingService } from '../../services/meetingService';
import { raceConditionService } from '../../services/raceConditionService';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
<<<<<<< HEAD
import { useAuth } from '../../hooks/useAuth';
=======
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
import { RACE_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';

const PAGE_SIZE = 10;
const EMPTY_FORM = {
  meetingId: '',
  conditionId: '',
  name: '',
  raceNo: '',
  raceTime: '',
  registrationOpenAt: '',
  registrationCloseAt: '',
};

// Shared form fields (used in both create inline form and edit modal)
<<<<<<< HEAD
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
        {mtgs.length === 0 && !loading && (
          <Form.Text style={{ color: '#888' }}>
            Chưa có meeting nào. Vui lòng tạo meeting trước.
          </Form.Text>
        )}
      </Form.Group>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Condition</Form.Label>
        <Form.Select {...reg('conditionId')}>
          <option value="">-- Chọn condition (tuỳ chọn) --</option>
          {conds.map((c) => <option key={c.id} value={c.id}>{c.conditionName} ({c.distance}m)</option>)}
        </Form.Select>
      </Form.Group>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Staff phụ trách</Form.Label>
        <Form.Select {...reg('staffId')}>
          <option value="">-- Chọn staff (tuỳ chọn) --</option>
          {slist.map((s) => <option key={s.staffId} value={s.staffId}>{s.fullName}</option>)}
        </Form.Select>
        {slist.length === 0 && (
          <Form.Text style={{ color: '#888' }}>
            Chưa có staff profile. Tạo tài khoản Staff mới trong trang Người dùng trước khi assign race.
          </Form.Text>
        )}
      </Form.Group>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Referee phụ trách</Form.Label>
        <Form.Select {...reg('refereeId')}>
          <option value="">-- Chọn referee (tuỳ chọn) --</option>
          {rlist.map((r) => <option key={r.refereeId} value={r.refereeId}>{r.fullName}</option>)}
        </Form.Select>
        {rlist.length === 0 && <Form.Text style={{ color: '#888' }}>Không tải được danh sách referee.</Form.Text>}
      </Form.Group>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Số thứ tự (Race No)</Form.Label>
        <Form.Control type="number" {...reg('raceNo')} placeholder="VD: 1" min="1" />
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
        <Form.Label style={{ color: '#D4AF37' }}>Mở đăng ký <span style={{ color: '#f6a', fontSize: '0.78rem' }}>(bắt buộc để owner thấy race)</span></Form.Label>
        <Form.Control type="datetime-local" {...reg('registrationOpenAt', { required: 'Ngày mở đăng ký là bắt buộc' })} isInvalid={!!errs.registrationOpenAt} />
        <Form.Control.Feedback type="invalid">{errs.registrationOpenAt?.message}</Form.Control.Feedback>
        <Form.Text style={{ color: '#888', fontSize: 11 }}>
          Phải ≤ ngày hiện tại để owner thấy race ngay. Backend lọc theo khoảng [mở ĐK, đóng ĐK].
        </Form.Text>
      </Form.Group>
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Đóng đăng ký <span style={{ color: '#e55' }}>*</span></Form.Label>
        <Form.Control type="datetime-local" {...reg('registrationCloseAt', { required: 'Thời hạn đăng ký là bắt buộc' })} isInvalid={!!errs.registrationCloseAt} />
        <Form.Control.Feedback type="invalid">{errs.registrationCloseAt?.message}</Form.Control.Feedback>
      </Form.Group>
    </>
  );
}

export default function RacesPage() {
  const { user } = useAuth();
=======
const RaceFormFields = ({ reg, errs, meetings: mtgs, conditions: conds, staff: slist, referees: rlist, loading }) => (
  <>
    <Form.Group>
      <Form.Label style={{ color: '#D4AF37' }}>Meeting <span style={{ color: '#e55' }}>*</span></Form.Label>
      <Form.Select {...reg('meetingId', { required: 'Chọn meeting' })} isInvalid={!!errs.meetingId}>
        <option value="">-- Chọn meeting --</option>
        {mtgs.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </Form.Select>
      <Form.Control.Feedback type="invalid">{errs.meetingId?.message}</Form.Control.Feedback>
      {mtgs.length === 0 && !loading && (
        <Form.Text style={{ color: '#888' }}>
          Chưa có meeting nào. Vui lòng tạo meeting trước.
        </Form.Text>
      )}
    </Form.Group>
    <Form.Group>
      <Form.Label style={{ color: '#D4AF37' }}>Condition</Form.Label>
      <Form.Select {...reg('conditionId')}>
        <option value="">-- Chọn condition (tuỳ chọn) --</option>
        {conds.map((c) => <option key={c.id} value={c.id}>{c.conditionName} ({c.distance}m)</option>)}
      </Form.Select>
    </Form.Group>
    <Form.Group>
      <Form.Label style={{ color: '#D4AF37' }}>Staff phụ trách</Form.Label>
      {slist.length > 0 ? (
        <Form.Select {...reg('staffId')}>
          <option value="">-- Chọn staff (tuỳ chọn) --</option>
          {slist.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </Form.Select>
      ) : (
        <>
          <Form.Control type="number" {...reg('staffId')} placeholder="Nhập ID của Staff (VD: 1, 2)" />
          <Form.Text style={{ color: '#888', fontSize: '0.8rem' }}>
            Do Backend chưa có API lấy danh sách, vui lòng nhập tay Staff ID.
          </Form.Text>
        </>
      )}
    </Form.Group>
    <Form.Group>
      <Form.Label style={{ color: '#D4AF37' }}>Referee phụ trách</Form.Label>
      {rlist.length > 0 ? (
        <Form.Select {...reg('refereeId')}>
          <option value="">-- Chọn referee (tuỳ chọn) --</option>
          {rlist.map((r) => <option key={r.id} value={r.id}>{r.fullName}</option>)}
        </Form.Select>
      ) : (
        <>
          <Form.Control type="number" {...reg('refereeId')} placeholder="Nhập ID của Referee" />
          <Form.Text style={{ color: '#888', fontSize: '0.8rem' }}>
            Do Backend chưa có API lấy danh sách, vui lòng nhập tay Referee ID.
          </Form.Text>
        </>
      )}
    </Form.Group>
    <Form.Group>
      <Form.Label style={{ color: '#D4AF37' }}>Số thực tế (Race No)</Form.Label>
      <Form.Control type="number" {...reg('raceNo')} placeholder="VD: 1" min="1" />
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
      <Form.Label style={{ color: '#D4AF37' }}>Mở đăng ký <span style={{ color: '#f6a', fontSize: '0.78rem' }}>(bắt buộc để owner thấy race)</span></Form.Label>
      <Form.Control type="datetime-local" {...reg('registrationOpenAt', { required: 'Ngày mở đăng ký là bắt buộc' })} isInvalid={!!errs.registrationOpenAt} />
      <Form.Control.Feedback type="invalid">{errs.registrationOpenAt?.message}</Form.Control.Feedback>
      <Form.Text style={{ color: '#888', fontSize: 11 }}>
        Phải &lt;= ngày hiện tại để owner thấy race ngay. Backend lọc theo khoảng [mở ĐK, đóng ĐK].
      </Form.Text>
    </Form.Group>
    <Form.Group>
      <Form.Label style={{ color: '#D4AF37' }}>Đóng đăng ký <span style={{ color: '#e55' }}>*</span></Form.Label>
      <Form.Control type="datetime-local" {...reg('registrationCloseAt', { required: 'Thời hạn đăng ký là bắt buộc' })} isInvalid={!!errs.registrationCloseAt} />
      <Form.Control.Feedback type="invalid">{errs.registrationCloseAt?.message}</Form.Control.Feedback>
    </Form.Group>
  </>
);

export default function RacesPage() {
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
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

  const onCreate = async (data) => {
    try {
      await raceService.create({
        ...data,
        meetingId: Number(data.meetingId),
        conditionId: data.conditionId ? Number(data.conditionId) : undefined,
        raceNo: data.raceNo ? Number(data.raceNo) : undefined,
      });
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
        conditionId: data.conditionId ? Number(data.conditionId) : undefined,
        raceNo: data.raceNo ? Number(data.raceNo) : undefined,
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
<<<<<<< HEAD
=======

>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
      let payload = { ...raceToUpdate, status };

      // Khi mở đăng ký: nếu registrationOpenAt chưa có → tự set về now
      // Backend lọc /races/open theo: registrationOpenAt <= now <= registrationCloseAt
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
  const conditionName = (id) => conditions.find((c) => c.id === id)?.conditionName ?? '—';

  const columns = [
    { key: 'raceNo', label: '#', render: (r) => r.raceNo ?? '—' },
    { key: 'name', label: 'Tên race' },
    { key: 'meetingId', label: 'Meeting', render: (r) => meetingName(r.meetingId) },
    { key: 'conditionId', label: 'Condition', render: (r) => conditionName(r.conditionId) },
    { key: 'raceTime', label: 'Giờ đua', render: (r) => formatDate(r.raceTime) },
<<<<<<< HEAD
    { key: 'registrationOpenAt', label: 'Mở ĐK', render: (r) => r.registrationOpenAt ? formatDate(r.registrationOpenAt) : '—' },
=======
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
    { key: 'registrationCloseAt', label: 'Đóng ĐK', render: (r) => r.registrationCloseAt ? formatDate(r.registrationCloseAt) : '—' },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'statusAction',
      label: 'Đổi trạng thái',
      render: (r) => (
        <Form.Select size="sm" value={r.status} style={{ maxWidth: 160 }} onChange={(e) => handleStatusChange(r.id, e.target.value)}>
<<<<<<< HEAD
          {[...new Set(Object.values(RACE_STATUS))].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
=======
          {Object.values(RACE_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
        </Form.Select>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
<<<<<<< HEAD
      render: (row) => {
        const isStaff = user?.role?.toLowerCase() === 'staff';
        return (
          <div className="d-flex gap-2 flex-wrap">
            {(row.status === RACE_STATUS.DRAFT || row.status === RACE_STATUS.SCHEDULED) && (
              <button
                className="btn btn-sm btn-success"
                title="Open registration for Owner"
                onClick={() => handleStatusChange(row.id, RACE_STATUS.OPEN_FOR_ENTRY)}
              >
                Mo DK
              </button>
            )}
            {false && (
              <button
                className="btn btn-sm btn-success"
                title="Mở đăng ký cho Owner"
                onClick={() => handleStatusChange(row.id, nextStatus)}
              >
                🔓 Mở ĐK
              </button>
            )}
            {!isStaff && <button className="btn-gold-sm" onClick={() => setEditRow(row)}>Sửa</button>}
            {!isStaff && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>Xoá</button>}
          </div>
        );
      },
=======
      render: (row) => (
        <div className="d-flex gap-2 flex-wrap">
          {(row.status === RACE_STATUS.DRAFT || row.status === RACE_STATUS.SCHEDULED) && (
            <button
              className="btn btn-sm btn-success"
              title="Mở đăng ký cho Owner"
              onClick={() => handleStatusChange(row.id, RACE_STATUS.OPEN_FOR_ENTRY)}
            >
              🔓 Mở ĐK
            </button>
          )}
          <button className="btn-gold-sm" onClick={() => setEditRow(row)}>Sửa</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>Xoá</button>
        </div>
      ),
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
    },
  ];
  const pageRows = races.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-header"><h2>Quản lý Race</h2></div>

      {/* Create inline form */}
<<<<<<< HEAD
      {user?.role?.toLowerCase() !== 'staff' && (
        <Form onSubmit={submitCreate(onCreate)} className="dash-card d-flex flex-wrap gap-3 align-items-start mb-4" noValidate>
          <RaceFormFields reg={regCreate} errs={createErrors} meetings={meetings} conditions={conditions} staff={staffList} referees={refereeList} loading={loading} />
          <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px', marginTop: '32px' }} disabled={meetings.length === 0}>
            Tạo Race
          </Button>
        </Form>
      )}
=======
      <Form onSubmit={submitCreate(onCreate)} className="dash-card d-flex flex-wrap gap-3 align-items-start mb-4" noValidate>
        <RaceFormFields reg={regCreate} errs={createErrors} meetings={meetings} conditions={conditions} staff={staffList} referees={refereeList} loading={loading} />
        <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px', marginTop: '32px' }} disabled={meetings.length === 0}>
          Tạo Race
        </Button>
      </Form>
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && races.length === 0 && <EmptyState message="Chưa có race nào." />}
      {!loading && !error && races.length > 0 && (
        <>
          <DataTable columns={columns} rows={pageRows} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={races.length} onPageChange={setPage} />
        </>
      )}

      {/* Edit Modal */}
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
