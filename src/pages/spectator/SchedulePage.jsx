import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { raceService } from '../../services/raceService';
import { meetingService } from '../../services/meetingService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import './spectator-theme.css'; // Import VIP Theme

export default function SpectatorSchedulePage() {
  const [races, setRaces] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    Promise.all([raceService.getPublic(), meetingService.getPublic()])
      .then(([r, m]) => { setRaces(r); setMeetings(m); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được lịch đua.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  return (
    <div className="spectator-context">
      <div className="spec-hero">
        <h2>LỊCH TRÌNH VIP</h2>
        <p>THEO DÕI NHỮNG TRẬN ĐUA ĐỈNH CAO SẮP DIỄN RA TRÊN HỆ THỐNG</p>
      </div>

      <div className="vip-panel">
        {loading && <Loading />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && races.length === 0 && <EmptyState message="Chưa có trận đua nào được lên lịch." />}
        
        {!loading && !error && races.length > 0 && (
          <div className="vip-table-wrapper">
            <table className="vip-table">
              <thead>
                <tr>
                  <th>Race</th>
                  <th>Meeting</th>
                  <th>Giờ đua</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {races.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong></td>
                    <td>{meetings.find((m) => m.id === r.meetingId)?.name || '—'}</td>
                    <td>{formatDate(r.raceTime)}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="text-end">
                      {r.status === RACE_STATUS.OFFICIAL ? (
                        <Link to={`/race-results/${r.id}`} className="btn-vip">
                          Kết Quả
                        </Link>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Chưa có</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
