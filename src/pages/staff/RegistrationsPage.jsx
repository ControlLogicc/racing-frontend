import { useEffect, useState } from 'react';
import { registrationService } from '../../services/registrationService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import RegistrationTable from '../../components/shared/RegistrationTable';

const PAGE_SIZE = 10;

// D11: Staff chỉ XEM danh sách đăng ký — KHÔNG approve/reject (registration không cần duyệt).
export default function StaffRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = () => {
    registrationService
      .getAll()
      .then(setRegistrations)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách đăng ký.')))
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

  const pageRows = registrations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-header">
        <h2>Danh sách đăng ký</h2>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          Xem thông tin đăng ký của owner. Đăng ký không cần duyệt theo quy trình mới.
        </p>
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && registrations.length === 0 && (
        <EmptyState message="Chưa có đăng ký nào." />
      )}
      {!loading && !error && registrations.length > 0 && (
        <>
          {/* Không truyền onApprove/onReject → RegistrationTable tự render read-only */}
          <RegistrationTable rows={pageRows} />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={registrations.length}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
