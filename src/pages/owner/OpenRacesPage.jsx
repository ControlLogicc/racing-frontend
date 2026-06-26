import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import './owner-theme.css';

export default function OwnerOpenRacesPage() {
  const navigate = useNavigate();
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    raceService
      .getOpen()
      .then((data) => setRaces(data))
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách race.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const columns = [
    {
      key: 'name',
      label: 'Tên race',
      render: (r) => (
        <span style={{ fontWeight: 700, color: '#f0e8d0' }}>{r.name}</span>
      ),
    },
    { key: 'meetingName', label: 'Meeting' },
    {
      key: 'distance',
      label: 'Cự ly',
      render: (r) => (
        <span style={{ color: '#D4AF37', fontWeight: 600 }}>{r.distance ?? '—'}m</span>
      ),
    },
    { key: 'raceTime', label: 'Ngày đua', render: (r) => formatDate(r.raceTime) },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button
          className="btn-gold btn-gold-sm"
          onClick={() => navigate(`/owner/register?raceId=${r.id}`)}
        >
          Tham gia đua
        </button>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      {/* Header */}
      <div className="page-header mb-4">
        <div>
          <h2>Races đang mở</h2>
          <p style={{ margin: 0, marginTop: 4 }}>Chọn race và đăng ký ngựa của bạn tham dự</p>
        </div>
        {races.length > 0 && (
          <div style={{
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: 10, padding: '8px 18px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D4AF37', lineHeight: 1 }}>{races.length}</div>
            <div style={{ fontSize: '0.68rem', color: '#6a5a40', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>
              Race mở
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="lux-panel">
        {races.length === 0 ? (
          <EmptyState message="Hiện không có race nào đang mở để đăng ký." />
        ) : (
          <DataTable columns={columns} rows={races} />
        )}
      </div>
    </div>
  );
}
