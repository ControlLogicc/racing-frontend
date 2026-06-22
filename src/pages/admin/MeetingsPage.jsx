import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { meetingService } from '../../services/meetingService';
import { seasonService } from '../../services/seasonService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';

const PAGE_SIZE = 10;

export default function MeetingsPage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);

  const load = () => {
    Promise.all([meetingService.getAll(), seasonService.getAll()])
      .then(([m, s]) => { setMeetings(m); setSeasons(s); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách meeting.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá meeting này?')) return;
    try {
      await meetingService.remove(id);
      setToast({ message: 'Đã xoá meeting.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Xoá thất bại.'), variant: 'danger' });
    }
  };

  const seasonName = (id) => seasons.find((s) => s.id === id)?.name ?? id;

  const columns = [
    { key: 'name', label: 'Tên meeting' },
    { key: 'seasonId', label: 'Season', render: (r) => seasonName(r.seasonId) },
    { key: 'racecourse', label: 'Đường đua' },
    { key: 'date', label: 'Ngày', render: (r) => formatDate(r.date) },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => (
        <div className="d-flex gap-2">
          <button className="btn-gold-sm" onClick={() => navigate(`/admin/meetings/edit/${row.id}`)}>Sửa</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>Xoá</button>
        </div>
      ),
    },
  ];

  const pageRows = meetings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2>Quản lý Meeting</h2>
        <Button className="btn-gold-sm" style={{ padding: '7px 18px' }} onClick={() => navigate('/admin/meetings/create')}>
          + Tạo Meeting mới
        </Button>
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && meetings.length === 0 && <EmptyState message="Chưa có meeting nào." />}
      {!loading && !error && meetings.length > 0 && (
        <>
          <DataTable columns={columns} rows={pageRows} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={meetings.length} onPageChange={setPage} />
        </>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
