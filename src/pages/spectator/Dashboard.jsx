import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { raceService } from '../../services/raceService';
import { meetingService } from '../../services/meetingService';
import { horseService } from '../../services/horseService';
import { resultService } from '../../services/resultService';
import { RACE_STATUS } from '../../constants/status';
import { formatDate } from '../../utils/formatDate';
import StatusBadge from '../../components/common/StatusBadge';
import './spectator-theme.css';

export default function SpectatorDashboard() {
  const { user } = useAuth();
  const name = user?.fullName || 'Khách danh dự';

  const [races, setRaces] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [horses, setHorses] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      raceService.getPublic(),
      meetingService.getPublic(),
      horseService.getPublicAll(),
      resultService.getAll(),
    ]).then(([r, m, h, res]) => {
      setRaces(r.status === 'fulfilled' ? r.value : []);
      setMeetings(m.status === 'fulfilled' ? m.value : []);
      setHorses(h.status === 'fulfilled' ? h.value : []);
      setResults(res.status === 'fulfilled' ? res.value : []);
    }).finally(() => setLoading(false));
  }, []);

  const upcomingRaces = races.filter((r) =>
    r.status !== RACE_STATUS.DRAFT && String(r.status).toUpperCase() !== 'DRAFT'
  );
  const activeMeetings = meetings.filter((m) =>
    m.status === 'ACTIVE' || m.status === 'ONGOING' || m.status === 'active'
  );
  const topJockeys = [...new Set(results.map((r) => r.jockeyName).filter(Boolean))].length;

  const stats = [
    { label: 'Upcoming Races', value: loading ? '—' : upcomingRaces.length },
    { label: 'Active Meetings', value: loading ? '—' : activeMeetings.length },
    { label: 'Horses Tracked', value: loading ? '—' : horses.length },
    { label: 'Top Jockeys', value: loading ? '—' : topJockeys },
  ];

  // 5 race sắp diễn ra gần nhất
  const nextRaces = [...upcomingRaces]
    .filter((r) => r.raceTime)
    .sort((a, b) => new Date(a.raceTime) - new Date(b.raceTime))
    .slice(0, 5);

  const actions = [
    { label: 'Race Schedule', to: '/schedule' },
    { label: 'Rankings', to: '/ranking' },
    { label: 'Horse Profiles', to: '/horses' },
  ];

  return (
    <div className="spectator-context">
      <div className="spec-hero">
        <h2>CHÀO MỪNG, {name.toUpperCase()}</h2>
        <p>KHÁN ĐÀI VIP - NƠI NHỮNG HUYỀN THOẠI ĐƯỜNG ĐUA ĐƯỢC VINH DANH</p>
      </div>

      {/* Stat cards */}
      <div className="row g-4 mb-4">
        {stats.map((stat, idx) => (
          <div className="col-6 col-md-3" key={idx}>
            <div className="vip-stat">
              <div className="vip-stat-value">{stat.value}</div>
              <div className="vip-stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Upcoming races table */}
        <div className="col-12 col-lg-7">
          <div className="vip-panel h-100">
            <div className="vip-panel-header">Race Sắp Diễn Ra</div>
            {nextRaces.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: 14, padding: '1rem 0' }}>Chưa có lịch đua.</div>
            ) : (
              <div className="vip-table-wrapper">
                <table className="vip-table">
                  <thead>
                    <tr>
                      <th>Tên Race</th>
                      <th>Giờ đua</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nextRaces.map((r) => (
                      <tr key={r.id}>
                        <td><strong style={{ color: '#fbbf24' }}>{r.name}</strong></td>
                        <td style={{ color: '#e2e8f0', whiteSpace: 'nowrap' }}>{formatDate(r.raceTime)}</td>
                        <td><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="col-12 col-lg-5">
          <div className="vip-panel h-100">
            <div className="vip-panel-header">Lối Tắt VIP</div>
            <div className="d-flex flex-column gap-3">
              {actions.map((action, idx) => (
                <Link key={idx} to={action.to} className="btn-vip w-100 text-center py-3 d-flex justify-content-between align-items-center">
                  <span>{action.label}</span>
                  <span style={{ fontSize: '1.2rem' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
