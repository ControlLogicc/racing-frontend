import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { OWNER_STATS, OWNER_ACTIVITY, OWNER_ACTIONS } from '../../mocks/mockDashboard';
import './owner-theme.css';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const name = user?.fullName || 'Owner';

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
            🐎
          </div>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {OWNER_STATS.map((item) => (
          <div className="col-6 col-xl-3" key={item.id}>
            <div className="lux-stat-card">
              <div className="lux-stat-icon">{STAT_ICONS[item.id] ?? '📊'}</div>
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
              {OWNER_ACTIVITY.map((it) => (
                <div className="activity-item" key={it.id}>
                  <div className="activity-dot" />
                  <span className="activity-text">{it.text}</span>
                  <span className="activity-time">{it.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="lux-panel h-100">
            <div className="owner-section-label"><h5>Quick Actions</h5></div>
            <div className="d-flex flex-column gap-2">
              {OWNER_ACTIONS.map((a) => (
                <Link key={a.id} to={a.to} className="quick-action-card">
                  <div className="quick-action-icon">{a.icon}</div>
                  <span className="quick-action-label">{a.label}</span>
                  <span className="quick-action-arrow">›</span>
                </Link>
              ))}
              <Link to="/owner/races" className="quick-action-card">
                <div className="quick-action-icon">🏁</div>
                <span className="quick-action-label">Races đang mở</span>
                <span className="quick-action-arrow">›</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const STAT_ICONS = {
  o1: '🐎',
  o2: '📝',
  o3: '✉️',
  o4: '🏁',
};
