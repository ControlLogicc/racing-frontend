import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button } from 'react-bootstrap';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

const PAGE_SIZE = 10;

const ROLE_BADGE = {
  ADMIN: 'danger',
  STAFF: 'warning',
  REFEREE: 'info',
  OWNER: 'primary',
  JOCKEY: 'success',
  SPECTATOR: 'secondary',
};

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = () => {
    userService
      .getAll()
      .then(setUsers)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách user.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => {
    setLoading(true);
    setError('');
    load();
  };

  const columns = [
    { key: 'fullName', label: 'Họ tên' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (user) => {
        const role = user.role?.toUpperCase();
        return <Badge bg={ROLE_BADGE[role] ?? 'secondary'}>{role || '-'}</Badge>;
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (user) => {
        const status = user.status ?? (user.locked ? 'SUSPENDED' : 'ACTIVE');
        const bgMap = { ACTIVE: 'success', PENDING: 'warning', REJECTED: 'danger', SUSPENDED: 'danger', INACTIVE: 'secondary' };
        return <Badge bg={bgMap[status] ?? 'secondary'}>{status}</Badge>;
      },
    },
  ];

  const pageRows = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <h2>Quản lý người dùng</h2>
        <Button className="btn-gold-sm" onClick={() => navigate('/admin/users/create')}>+ Tạo tài khoản</Button>
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
    </div>
  );
}
