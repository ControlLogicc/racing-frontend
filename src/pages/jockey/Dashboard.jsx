import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { invitationService } from '../../services/invitationService';
import { jockeyService } from '../../services/jockeyService';
import { RACE_INVITATION_STATUS } from '../../constants/status';
import { StatCardGrid, QuickActions } from '../../components/common/DashboardWidgets';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import { Calendar3, EnvelopePaperFill, TrophyFill, CheckCircleFill, PeopleFill } from 'react-bootstrap-icons';
import '../owner/owner-theme.css';

const GOLD = '#D4AF37';

const QUICK_ACTIONS = [
  { id: 'qa1', label: 'Lời mời đua', to: '/jockey/invitations', icon: <EnvelopePaperFill size={20} className="me-2" /> },
  { id: 'qa2', label: 'Lịch đua của tôi', to: '/jockey/races', icon: <Calendar3 size={20} className="me-2" /> },
  { id: 'qa3', label: 'Hồ sơ cá nhân', to: '/jockey/profile', icon: <PeopleFill size={20} className="me-2" /> },
];

export default function JockeyDashboard() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [invs, regs] = await Promise.all([
        invitationService.getByJockey().catch(() => []), // Fallback if API missing
        jockeyService.getMyRaceRegistrations().catch(() => []), // Fallback if API missing
      ]);
      setInvitations(invs);
      setRegistrations(regs);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(`Không tải được dữ liệu dashboard: ${err.message || err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const pendingInvitations = invitations.filter((i) => i.status === RACE_INVITATION_STATUS.SENT);
  const upcomingRaces = registrations; // Tạm đếm tất cả registrations của jockey

  const stats = [
    {
      id: 's1',
      label: 'Lời mời chờ duyệt',
      value: pendingInvitations.length,
      hint: 'Từ các chủ ngựa',
      accent: 'warning',
    },
    {
      id: 's2',
      label: 'Lịch đua',
      value: upcomingRaces.length,
      hint: 'Races đã đăng ký tham gia',
      accent: 'primary',
    },
    {
      id: 's3',
      label: 'Thu nhập (Ước tính)',
      value: '—',
      hint: 'Đang cập nhật tính năng...',
      accent: 'success',
    },
  ];

  return (
    <div>
      <div className="owner-hero smooth-hover">
        <div className="owner-hero-name">Xin chào, <em>{user?.fullName || 'Jockey'}</em> 🏇</div>
        <div className="owner-hero-sub mt-2">
          Theo dõi lời mời đua từ các chủ ngựa và chuẩn bị cho các giải đấu sắp tới.
        </div>
      </div>

      <div className="row g-4 mb-4">
        {stats.map((s) => (
          <div className="col-12 col-md-4" key={s.id}>
            <div className="lux-stat-card smooth-hover">
              <div className="lux-stat-icon">
                {s.accent === 'warning' && <EnvelopePaperFill />}
                {s.accent === 'primary' && <CheckCircleFill />}
                {s.accent === 'success' && <TrophyFill />}
              </div>
              <div className="lux-stat-value">{s.value}</div>
              <div className="lux-stat-label">{s.label}</div>
              <div className="lux-stat-hint">{s.hint}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="lux-panel smooth-hover">
            <div className="owner-section-label mb-4">
              <h5>Lời mời gần đây</h5>
              <span className="badge ms-2" style={{ backgroundColor: '#D4AF37', color: '#111', fontSize: '0.75rem' }}>
                {pendingInvitations.length}
              </span>
            </div>
            
            {pendingInvitations.length === 0 ? (
              <div className="text-center p-4" style={{ color: '#6a6250', border: '1px dashed rgba(212,175,55,0.2)', borderRadius: 12 }}>
                Hiện không có lời mời mới nào.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {pendingInvitations.slice(0, 3).map((inv) => (
                  <div key={inv.id} className="dash-card d-flex justify-content-between align-items-center smooth-hover">
                    <div>
                      <div style={{ color: '#D4AF37', fontWeight: 600 }}>{inv.raceName}</div>
                      <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
                        Ngựa: <strong>{inv.horseName}</strong> • Chủ: <strong>{inv.ownerName}</strong>
                      </div>
                    </div>
                    <Link to="/jockey/invitations" className="btn-outline-gold-sm" style={{ textDecoration: 'none' }}>
                      Xem chi tiết →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="col-12 col-lg-4">
          <QuickActions title="Thao tác nhanh" actions={QUICK_ACTIONS} />
        </div>
      </div>
    </div>
  );
}
