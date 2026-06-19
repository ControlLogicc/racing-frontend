import { useEffect, useState } from 'react';
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
const EMPTY_CREATE = { fullName: '', email: '', password: '', role: ROLES.SPECTATOR };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);

  const load = () => {
    userService
      .getAll()
      .then(setUsers)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách user.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await userService.create(createForm);
      setToast({ message: 'Tạo tài khoản thành công.', variant: 'success' });
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo tài khoản thất bại.'), variant: 'danger' });
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await userService.setRole(id, role);
      setToast({ message: 'Đã cập nhật role.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật role thất bại.'), variant: 'danger' });
    }
  };

  const handleToggleLock = async (id, locked) => {
    try {
      await userService.setLocked(id, !locked);
      setToast({ message: !locked ? 'Đã khoá tài khoản.' : 'Đã mở khoá tài khoản.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Thao tác thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'fullName', label: 'Họ tên' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (u) => (
        <Form.Select size="sm" value={u.role} style={{ maxWidth: 160 }} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
          {Object.values(ROLES).map((r) => <option key={r} value={r}>{r}</option>)}
        </Form.Select>
      ),
    },
    {
      key: 'locked',
      label: 'Trạng thái',
      render: (u) => <Badge bg={u.locked ? 'danger' : 'success'}>{u.locked ? 'Đã khoá' : 'Hoạt động'}</Badge>,
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (u) => (
        <button className={u.locked ? 'btn-gold-sm' : 'btn-outline-gold-sm'} onClick={() => handleToggleLock(u.id, u.locked)}>
          {u.locked ? 'Mở khoá' : 'Khoá'}
        </button>
      ),
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
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Tạo tài khoản mới</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <Form onSubmit={handleCreate} className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Họ tên</Form.Label>
              <Form.Control
                value={createForm.fullName}
                onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Email</Form.Label>
              <Form.Control
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                required
                minLength={6}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Role</Form.Label>
              <Form.Select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
                {Object.values(ROLES).map((r) => <option key={r} value={r}>{r}</option>)}
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Huỷ</Button>
              <Button type="submit" className="btn-gold-sm">Tạo</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
