import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registrationService';
import { horseService } from '../../services/horseService';
import { invitationService } from '../../services/invitationService';
import { Trophy, FileEarmarkText, EnvelopePaper, EnvelopeCheck, Flag, PencilSquare, JournalCheck } from 'react-bootstrap-icons';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import './owner-theme.css';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const name = user?.fullName || 'Owner';

  const [stats, setStats] = useState({
    totalHorses: 0,
    totalRegistrations: 0,
    pendingInvitations: 0,
    acceptedInvitations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [regsResult, horsesResult, invsResult] = await Promise.allSettled([
          registrationService.getByOwner(),
          horseService.getByOwner(),
          invitationService.getAll(),
        ]);

        const regs = regsResult.status === 'fulfilled' ? regsResult.value : [];
        const horses = horsesResult.status === 'fulfilled' ? horsesResult.value : [];
        const invs = invsResult.status === 'fulfilled' ? invsResult.value : [];

        setStats({
          totalHorses: horses.length,
          totalRegistrations: regs.length,
          pendingInvitations: invs.filter(i => i.status === 'SENT').length,
          acceptedInvitations: invs.filter(i => i.status === 'ACCEPTED').length,
        });
      } catch (err) {
        setError('Lỗi khi tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  const statCards = [
    { id: 'o1', label: 'Ngựa của bạn', value: stats.totalHorses, hint: 'Số lượng trong chuồng', icon: <Trophy size={20} /> },
    { id: 'o2', label: 'Tổng đăng ký', value: stats.totalRegistrations, hint: 'Đã nộp tham gia race', icon: <FileEarmarkText size={20} /> },
    { id: 'o3', label: 'Lời mời chờ duyệt', value: stats.pendingInvitations, hint: 'Đã gửi đến Jockey', icon: <EnvelopePaper size={20} /> },
    { id: 'o4', label: 'Lời mời đã nhận', value: stats.acceptedInvitations, hint: 'Jockey đã đồng ý', icon: <EnvelopeCheck size={20} /> },
  ];

  const QUICK_ACTIONS = [
    { id: 'qa1', label: 'Ngựa của tôi', to: '/owner/horses', icon: <Trophy size={20} /> },
    { id: 'qa2', label: 'Races đang mở', to: '/owner/races', icon: <Flag size={20} /> },
    { id: 'qa3', label: 'Đăng ký đua', to: '/owner/registrations', icon: <PencilSquare size={20} /> },
    { id: 'qa4', label: 'Lời mời Jockey', to: '/owner/invitations', icon: <JournalCheck size={20} /> },
  ];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="owner-hero mb-4">
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
          <div>
            <div className="owner-hero-badge mb-3">🏇 Racing Owner Portal</div>
            <div className="owner-hero-name">
              Welcome back, <em>{name}</em>
            </div>
            <div className="owner-hero-sub mt-1">
              Manage your stable, race registrations and jockey invitations
            </div>
          </div>
          <div className="text-end d-none d-md-block" style={{ opacity: 0.15, fontSize: '5rem', lineHeight: 1 }}>
            <Trophy size={80} color="#D4AF37" />
          </div>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {statCards.map((item) => (
          <div className="col-6 col-xl-3" key={item.id}>
            <div className="lux-stat-card">
              <div className="lux-stat-icon" style={{ color: '#D4AF37' }}>{item.icon}</div>
              <div className="lux-stat-value">{item.value}</div>
              <div className="lux-stat-label">{item.label}</div>
              {item.hint && <div className="lux-stat-hint">{item.hint}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Body: Activity + Quick Actions ───────────────────── */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="lux-panel h-100">
            <div className="owner-section-label"><h5>Recent Activity</h5></div>
            <div className="activity-feed">
              <div className="activity-item">
                <div className="activity-dot" />
                <span className="activity-text">Vui lòng kiểm tra các đăng ký và lời mời mới trong menu thao tác nhanh bên phải.</span>
                <span className="activity-time">Hôm nay</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="lux-panel h-100">
            <div className="owner-section-label"><h5>Quick Actions</h5></div>
            <div className="d-flex flex-column gap-2">
              {QUICK_ACTIONS.map((a) => (
                <Link key={a.id} to={a.to} className="quick-action-card">
                  <div className="quick-action-icon" style={{ color: '#D4AF37' }}>{a.icon}</div>
                  <span className="quick-action-label">{a.label}</span>
                  <span className="quick-action-arrow">›</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
