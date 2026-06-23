import { useEffect, useState } from 'react';
import { registrationService } from '../../services/registrationService';
import { getApiErrorMessage } from '../../utils/apiError';
import { RACE_REGISTRATION_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import RegistrationTable from '../../components/shared/RegistrationTable';
import Toaster from '../../components/common/Toaster';

const PAGE_SIZE = 10;

// Staff duyệt/từ chối Registration ở trạng thái PENDING_REVIEW (theo state machine diagram)
export default function StaffRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

  const load = () => {
    registrationService
      .getAll()
      .then(setRegistrations)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách đăng ký.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const handleApprove = async (id) => {
    try {
      await registrationService.approve(id);
      setToast({ message: 'Đã duyệt đăng ký thành công.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Duyệt đăng ký thất bại.'), variant: 'danger' });
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Xác nhận từ chối đăng ký này?')) return;
    try {
      await registrationService.reject(id);
      setToast({ message: 'Đã từ chối đăng ký.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Từ chối thất bại.'), variant: 'danger' });
    }
  };

  const pending = registrations.filter((r) => r.status === RACE_REGISTRATION_STATUS.PENDING_REVIEW || r.status === 'PENDING_REVIEW' || r.status === 'PENDING').length;
  const pageRows = registrations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>
            Đăng ký Race
            {pending > 0 && (
              <span className="badge ms-2" style={{ backgroundColor: '#f0a500', color: '#111', fontSize: '0.75rem' }}>
                {pending} chờ duyệt
              </span>
            )}
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Duyệt đăng ký ở trạng thái <strong>Chờ duyệt</strong> để owner được mời Jockey.
          </p>
        </div>
      </div>

      <div className="alert alert-info mb-4" style={{ fontSize: '0.9rem' }}>
        <strong>Lưu ý quan trọng:</strong> Bạn chỉ nhìn thấy Đăng ký của những Cuộc đua (Race) mà Admin đã <strong>phân công cho bạn phụ trách</strong>. Nếu danh sách trống, hãy dùng tài khoản Admin gán Cuộc đua cho tài khoản Staff này trước!
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && registrations.length === 0 && (
        <EmptyState message="Chưa có đăng ký nào." />
      )}
      {!loading && !error && registrations.length > 0 && (
        <>
          <RegistrationTable
            rows={pageRows}
            onApprove={handleApprove}
            onReject={handleReject}
          />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={registrations.length}
            onPageChange={setPage}
          />
        </>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
