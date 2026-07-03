import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Modal, Form } from 'react-bootstrap';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';

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
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [banTarget, setBanTarget] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [unbanningId, setUnbanningId] = useState(null);

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

  const isBanned = (user) => String(user.accountStatus || '').toLowerCase() === 'banned';

  const handleBanSubmit = async (e) => {
    e.preventDefault();
    if (!banReason.trim()) return;
    setSubmitting(true);
    try {
      await userService.banUser(banTarget.userId, banReason.trim());
      setToast({ message: `Đã khoá tài khoản "${banTarget.fullName}".`, variant: 'success' });
      setBanTarget(null);
      setBanReason('');
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Khoá tài khoản thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnban = async (user) => {
    if (!window.confirm(`Mở khoá tài khoản "${user.fullName}"?`)) return;
    setUnbanningId(user.userId);
    try {
      await userService.unbanUser(user.userId);
      setToast({ message: `Đã mở khoá tài khoản "${user.fullName}".`, variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Mở khoá thất bại.'), variant: 'danger' });
    } finally {
      setUnbanningId(null);
    }
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
    {
      key: 'accountStatus',
      label: 'Tài khoản',
      render: (user) => isBanned(user) ? (
        <div>
          <Badge bg="danger">BANNED</Badge>
          {user.bannedReason && (
            <div style={{ fontSize: '0.72rem', color: '#888', marginTop: 4, maxWidth: 220 }}>
              {user.bannedReason}
              {user.bannedAt && <div>{formatDate(user.bannedAt)}</div>}
            </div>
          )}
        </div>
      ) : (
        <Badge bg="success">ACTIVE</Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (user) => {
        if (user.userId === currentUser?.userId) return null;
        return isBanned(user) ? (
          <Button
            size="sm"
            variant="outline-success"
            disabled={unbanningId === user.userId}
            onClick={() => handleUnban(user)}
          >
            {unbanningId === user.userId ? 'Đang mở...' : 'Mở khoá'}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => { setBanTarget(user); setBanReason(''); }}
          >
            Khoá tài khoản
          </Button>
        );
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
          <DataTable columns={columns} rows={pageRows} rowKey="userId" />
          <Pagination page={page} pageSize={PAGE_SIZE} total={users.length} onPageChange={setPage} />
        </>
      )}

      {/* Modal khoá tài khoản — cần lý do (BE bắt buộc, max 500 ký tự) */}
      <Modal show={!!banTarget} onHide={() => setBanTarget(null)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Khoá tài khoản — {banTarget?.fullName}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBanSubmit}>
          <Modal.Body style={{ background: '#1a1a2e' }}>
            <Form.Group>
              <Form.Label style={{ color: '#e0d6b0' }}>Lý do khoá <span style={{ color: '#e55' }}>*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                maxLength={500}
                required
                placeholder="VD: Vi phạm điều khoản sử dụng..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ background: '#1a1a2e', borderColor: '#333' }}>
            <Button variant="secondary" onClick={() => setBanTarget(null)}>Huỷ</Button>
            <Button type="submit" variant="danger" disabled={submitting || !banReason.trim()}>
              {submitting ? 'Đang khoá...' : 'Xác nhận khoá'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
