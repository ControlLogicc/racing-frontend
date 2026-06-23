import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Badge, Button, Modal } from 'react-bootstrap';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/apiError';
import { ROLES } from '../../constants/roles';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';

const PAGE_SIZE = 10;

const ROLE_BADGE = {
  ADMIN: 'danger', STAFF: 'warning', REFEREE: 'info',
  OWNER: 'primary', JOCKEY: 'success', SPECTATOR: 'secondary',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    defaultValues: { fullName: '', email: '', password: '', phone: '', role: ROLES.SPECTATOR },
  });

  const selectedRole = watch('role');

  const load = () => {
    userService
      .getAll()
      .then(setUsers)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách user.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const handleClose = () => { setShowCreate(false); reset(); };

  const onSubmit = async (data) => {
    try {
      await userService.create(data);
      setToast({ message: 'Tạo tài khoản thành công.', variant: 'success' });
      handleClose();
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo tài khoản thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'fullName', label: 'Họ tên' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (u) => {
        const role = u.role?.toUpperCase();
        return <Badge bg={ROLE_BADGE[role] ?? 'secondary'}>{role || '—'}</Badge>;
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (u) => {
        const s = u.status ?? (u.locked ? 'SUSPENDED' : 'ACTIVE');
        const bgMap = { ACTIVE: 'success', PENDING: 'warning', REJECTED: 'danger', SUSPENDED: 'danger', INACTIVE: 'secondary' };
        return <Badge bg={bgMap[s] ?? 'secondary'}>{s}</Badge>;
      },
    },
  ];
  const pageRows = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <h2>Quản lý người dùng</h2>
        <Button className="btn-gold-sm" onClick={() => setShowCreate(true)}>+ Tạo tài khoản</Button>
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && users.length === 0 && <EmptyState message="Chưa có user nào." />}
      {!loading && !error && users.length > 0 && (
        <>
          <DataTable columns={columns} rows={pageRows} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={users.length} onPageChange={setPage} />
        </>
      )}

      {/* Create Modal */}
      <Modal show={showCreate} onHide={handleClose} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Tạo tài khoản mới</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <Form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3" noValidate>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Họ tên</Form.Label>
              <Form.Control
                {...register('fullName', { required: 'Họ tên là bắt buộc' })}
                isInvalid={!!errors.fullName}
              />
              <Form.Control.Feedback type="invalid">{errors.fullName?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Email</Form.Label>
              <Form.Control
                type="email"
                {...register('email', {
                  required: 'Email là bắt buộc',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' },
                })}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: { value: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
                })}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Số điện thoại</Form.Label>
              <Form.Control type="tel" {...register('phone')} placeholder="0901234567" />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Role</Form.Label>
              <Form.Select {...register('role', { required: true })}>
                {Object.values(ROLES).map((r) => <option key={r} value={r}>{r}</option>)}
              </Form.Select>
            </Form.Group>

            {/* Các trường bổ sung theo Role */}
            {selectedRole === ROLES.STAFF && (
              <>
                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Staff Code *</Form.Label>
                  <Form.Control {...register('staffCode', { required: 'Staff code là bắt buộc' })} isInvalid={!!errors.staffCode} />
                  <Form.Control.Feedback type="invalid">{errors.staffCode?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Phòng ban (Department) *</Form.Label>
                  <Form.Control {...register('department', { required: 'Phòng ban là bắt buộc' })} isInvalid={!!errors.department} />
                  <Form.Control.Feedback type="invalid">{errors.department?.message}</Form.Control.Feedback>
                </Form.Group>
              </>
            )}

            {selectedRole === ROLES.JOCKEY && (
              <div className="d-flex gap-3">
                <Form.Group className="flex-fill">
                  <Form.Label style={{ color: '#D4AF37' }}>Cân nặng (kg) *</Form.Label>
                  <Form.Control type="number" step="0.1" min="0" {...register('weight', { required: 'Cân nặng là bắt buộc', min: 0.1 })} isInvalid={!!errors.weight} />
                  <Form.Control.Feedback type="invalid">{errors.weight?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="flex-fill">
                  <Form.Label style={{ color: '#D4AF37' }}>Năm kinh nghiệm *</Form.Label>
                  <Form.Control type="number" min="0" {...register('experienceYears', { required: 'Kinh nghiệm là bắt buộc', min: 0 })} isInvalid={!!errors.experienceYears} />
                  <Form.Control.Feedback type="invalid">{errors.experienceYears?.message}</Form.Control.Feedback>
                </Form.Group>
              </div>
            )}

            {selectedRole === ROLES.REFEREE && (
              <Form.Group>
                <Form.Label style={{ color: '#D4AF37' }}>Số giấy phép (License No) *</Form.Label>
                <Form.Control {...register('licenseNo', { required: 'License No là bắt buộc' })} isInvalid={!!errors.licenseNo} />
                <Form.Control.Feedback type="invalid">{errors.licenseNo?.message}</Form.Control.Feedback>
              </Form.Group>
            )}

            <div className="d-flex justify-content-end gap-2 mt-2">
              <Button variant="secondary" onClick={handleClose}>Huỷ</Button>
              <Button type="submit" className="btn-gold-sm">Tạo</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
