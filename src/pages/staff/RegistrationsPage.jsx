import { useEffect, useState } from 'react';
import { registrationService } from '../../services/registrationService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';
import RegistrationTable from '../../components/shared/RegistrationTable';

const PAGE_SIZE = 10;

export default function StaffRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
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

  const handleApprove = async (id) => {
    try {
      await registrationService.approve(id);
      setToast({ message: 'Đã duyệt đăng ký.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Duyệt thất bại.'), variant: 'danger' });
    }
  };

  const handleReject = async (id) => {
    try {
      await registrationService.reject(id);
      setToast({ message: 'Đã từ chối đăng ký.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Từ chối thất bại.'), variant: 'danger' });
    }
  };

  const pageRows = registrations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-header"><h2>Duyệt đăng ký đua</h2></div>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && registrations.length === 0 && <EmptyState message="Chưa có đăng ký nào." />}
      {!loading && !error && registrations.length > 0 && (
        <>
          <RegistrationTable rows={pageRows} onApprove={handleApprove} onReject={handleReject} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={registrations.length} onPageChange={setPage} />
        </>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
