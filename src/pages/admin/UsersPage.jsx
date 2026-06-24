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

<<<<<<< HEAD
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: { fullName: '', email: '', password: '', phone: '', role: ROLES.SPECTATOR },
    shouldUnregister: true,
  });

  const selectedRole = watch('role');

=======
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { fullName: '', email: '', password: '', phone: '', role: ROLES.SPECTATOR },
  });

>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
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
<<<<<<< HEAD

            {/* Profile fields for STAFF */}
            {selectedRole === ROLES.STAFF && (
              <>
                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Mã nhân viên</Form.Label>
                  <Form.Control
                    {...register('staffCode', { required: 'Mã nhân viên là bắt buộc' })}
                    isInvalid={!!errors.staffCode}
                    placeholder="STF-123"
                  />
                  <Form.Control.Feedback type="invalid">{errors.staffCode?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Phòng ban</Form.Label>
                  <Form.Control
                    {...register('department', { required: 'Phòng ban là bắt buộc' })}
                    isInvalid={!!errors.department}
                    placeholder="Operations"
                  />
                  <Form.Control.Feedback type="invalid">{errors.department?.message}</Form.Control.Feedback>
                </Form.Group>
              </>
            )}

            {/* Profile fields for REFEREE */}
            {selectedRole === ROLES.REFEREE && (
              <Form.Group>
                <Form.Label style={{ color: '#D4AF37' }}>Số giấy phép trọng tài</Form.Label>
                <Form.Control
                  {...register('licenseNo', { required: 'Số giấy phép là bắt buộc' })}
                  isInvalid={!!errors.licenseNo}
                  placeholder="LIC-12345"
                />
                <Form.Control.Feedback type="invalid">{errors.licenseNo?.message}</Form.Control.Feedback>
              </Form.Group>
            )}

            {/* Profile fields for JOCKEY */}
            {selectedRole === ROLES.JOCKEY && (
              <>
                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Cân nặng (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    {...register('weight', {
                      required: 'Cân nặng là bắt buộc',
                      min: { value: 30, message: 'Cân nặng phải từ 30kg đến 80kg' },
                      max: { value: 80, message: 'Cân nặng phải từ 30kg đến 80kg' },
                    })}
                    isInvalid={!!errors.weight}
                    placeholder="52.5"
                  />
                  <Form.Control.Feedback type="invalid">{errors.weight?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Số năm kinh nghiệm</Form.Label>
                  <Form.Control
                    type="number"
                    {...register('experienceYears', {
                      required: 'Kinh nghiệm là bắt buộc',
                      min: { value: 0, message: 'Số năm kinh nghiệm không thể âm' },
                    })}
                    isInvalid={!!errors.experienceYears}
                    placeholder="5"
                  />
                  <Form.Control.Feedback type="invalid">{errors.experienceYears?.message}</Form.Control.Feedback>
                </Form.Group>
              </>
            )}
=======
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
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
