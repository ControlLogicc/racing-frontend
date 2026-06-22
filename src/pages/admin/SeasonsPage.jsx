import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { seasonService } from '../../services/seasonService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';

export default function SeasonsPage() {
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const load = () => {
    seasonService.getAll()
      .then(setSeasons)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách season.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá season này?')) return;
    try {
      await seasonService.remove(id);
      setToast({ message: 'Đã xoá season.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Xoá thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'name', label: 'Tên mùa giải' },
    { key: 'startDate', label: 'Bắt đầu' },
    { key: 'endDate', label: 'Kết thúc' },
    { key: 'status', label: 'Trạng thái' },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => (
        <div className="d-flex gap-2">
          <button className="btn-gold-sm" onClick={() => navigate(`/admin/seasons/edit/${row.id}`)}>Sửa</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>Xoá</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2>Quản lý Season</h2>
        <Button className="btn-gold-sm" style={{ padding: '7px 18px' }} onClick={() => navigate('/admin/seasons/create')}>
          + Tạo Season mới
        </Button>
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && seasons.length === 0 && <EmptyState message="Chưa có season nào." />}
      {!loading && !error && seasons.length > 0 && <DataTable columns={columns} rows={seasons} />}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
