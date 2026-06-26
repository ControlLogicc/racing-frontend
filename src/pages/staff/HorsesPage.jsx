import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { horseService } from '../../services/horseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';
import './staff-theme.css';

export default function StaffHorsesPage() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Vì frontend dùng getPublicAll tạm để load danh sách ngựa nếu ko có backend
  const load = () => {
    setLoading(true);
    // Thực tế sẽ gọi api.get('/staff/horses/pending')
    horseService.adminGetAll ? horseService.adminGetAll() : horseService.getAll()
      .then((data) => {
        // Chỉ hiện những con cần duyệt (giả sử có trường status pending hoặc ratingVerified = false)
        const pending = data.filter(h => h.status === 'pending' || h.status === 'PENDING' || !h.ratingVerified);
        setHorses(pending.length ? pending : data); // Nếu k có pending thì show hết để test UI
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách ngựa.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = (horseId) => {
    if (window.confirm('Xác nhận duyệt ngựa này hợp lệ?')) {
      if (horseService.verifyRating) {
        horseService.verifyRating(horseId, 'APPROVE')
          .then(() => {
            setToast({ message: 'Đã duyệt ngựa thành công', variant: 'success' });
            load();
          })
          .catch(err => setToast({ message: 'Lỗi: ' + getApiErrorMessage(err), variant: 'danger' }));
      } else {
        setToast({ message: 'Chức năng chưa mock', variant: 'warning' });
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Tên ngựa' },
    { key: 'ownerName', label: 'Chủ ngựa' },
    { key: 'age', label: 'Tuổi' },
    { key: 'registrationType', label: 'Loại đăng ký', render: (h) => h.registrationType === 'NEW' ? 'Ngựa mới' : 'Tái đăng ký' },
    { key: 'rating', label: 'Rating (Claimed)' },
    { key: 'status', label: 'Trạng thái', render: (h) => <StatusBadge status={h.status} /> },
    {
      key: 'actions', label: 'Hành động', render: (h) => (
        <Button className="staff-btn-gold" size="sm" onClick={() => handleApprove(h.id)}>
          Duyệt
        </Button>
      )
    }
  ];

  return (
    <div className="staff-theme-wrapper p-3">
      <div className="page-header mb-4">
        <div>
          <h2 className="staff-header-title">Duyệt thông tin ngựa</h2>
          <p className="staff-subtitle mb-0">Xác thực hồ sơ và cập nhật trạng thái hoạt động cho ngựa.</p>
        </div>
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && horses.length === 0 && <EmptyState message="Không có ngựa nào cần duyệt." />}
      
      {!loading && !error && horses.length > 0 && (
        <div className="staff-card p-3">
          <DataTable columns={columns} rows={horses} rowClassName={() => 'align-middle'} />
        </div>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
