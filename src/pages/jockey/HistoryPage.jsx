import { useEffect, useState } from 'react';
import { jockeyService } from '../../services/jockeyService';
import JockeyHistoryPanel from '../../components/jockey/JockeyHistoryPanel';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import '../owner/owner-theme.css'; // For lux-panel styling

export default function JockeyHistoryPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    jockeyService.getProfile()
      .then(setProfile)
      .catch((err) => {
        if (err.response?.status === 404) setProfile(null);
        else setError('Không tải được thông tin Jockey.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  if (!profile || !profile.jockeyId) {
    return (
      <div className="lux-panel">
        <div className="text-center p-5" style={{ color: '#94a3b8' }}>
          Bạn chưa có hồ sơ Jockey nên chưa có dữ liệu lịch sử thi đấu.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header mb-4 smooth-hover">
        <div>
          <h2>Lịch sử thi đấu</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem', marginTop: 4 }}>
            Xem lại các thành tích, kết quả đua và điểm số của bạn.
          </p>
        </div>
      </div>
      
      <div className="lux-panel smooth-hover">
        <JockeyHistoryPanel jockeyId={profile.jockeyId} />
      </div>
    </div>
  );
}
