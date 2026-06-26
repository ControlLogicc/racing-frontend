import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { SPECTATOR_STATS, SPECTATOR_ACTIVITY, SPECTATOR_ACTIONS } from '../../mocks/mockDashboard';
import './spectator-theme.css'; // Import VIP Theme

export default function SpectatorDashboard() {
  const { user } = useAuth();
  const name = user?.fullName || 'Khách danh dự';

  return (
    <div className="spectator-context">
      <div className="spec-hero">
        <h2>CHÀO MỪNG, {name.toUpperCase()}</h2>
        <p>KHÁN ĐÀI VIP - NƠI NHỮNG HUYỀN THOẠI ĐƯỜNG ĐUA ĐƯỢC VINH DANH</p>
      </div>

      <div className="row g-4 mb-4">
        {SPECTATOR_STATS.map((stat, idx) => (
          <div className="col-12 col-md-4" key={idx}>
            <div className="vip-stat">
              <div className="vip-stat-value">{stat.value}</div>
              <div className="vip-stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="vip-panel h-100">
            <div className="vip-panel-header">Hoạt Động Mới Nhất</div>
            <div className="d-flex flex-column gap-3">
              {SPECTATOR_ACTIVITY.map((item, idx) => (
                <div key={idx} className="d-flex gap-3 align-items-start p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ width: 10, height: 10, background: '#fbbf24', borderRadius: '50%', marginTop: 6, boxShadow: '0 0 10px #fbbf24' }}></div>
                  <div>
                    <div style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>{item.text}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 4 }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="vip-panel h-100">
            <div className="vip-panel-header">Lối Tắt VIP</div>
            <div className="d-flex flex-column gap-3">
              {SPECTATOR_ACTIONS.map((action, idx) => (
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
