import { useEffect, useState } from 'react';
import { Form, Badge } from 'react-bootstrap';
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);

  const load = () => {
    userService
      .getAll()
      .then(setUsers)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách user.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const refetch = () => {
    setLoading(true);
    setError('');
    load();
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
      <div className="page-header"><h2>Quản lý người dùng</h2></div>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && users.length === 0 && <EmptyState message="Chưa có user nào." />}
      {!loading && !error && users.length > 0 && (
        <>
          <DataTable columns={columns} rows={pageRows} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={users.length} onPageChange={setPage} />
        </>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
