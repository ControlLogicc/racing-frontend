import { Link } from 'react-router-dom';

const ACCENT = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#d4af37',
  danger: '#ef4444',
  info: '#06b6d4',
};

export function StatCardGrid({ items = [] }) {
  return (
    <div className="row g-3 mb-4">
      {items.map((item) => (
        <div className="col-12 col-sm-6 col-xl-3" key={item.id}>
          <div style={{
            background: '#111114',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10,
            padding: '18px 20px',
            borderTop: `2px solid ${ACCENT[item.accent] || ACCENT.warning}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#e9e4d6', lineHeight: 1, marginBottom: 6 }}>
              {item.value}
            </div>
            {item.hint && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{item.hint}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityPanel({ title = 'Recent Activity', items = [] }) {
  return (
    <div style={{
      background: '#111114',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10,
      overflow: 'hidden',
      height: '100%',
    }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#e9e4d6' }}>{title}</span>
      </div>
      <div>
        {items.length === 0 && (
          <div style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            Chưa có hoạt động nào.
          </div>
        )}
        {items.map((it) => (
          <div
            key={it.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '12px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13.5, color: '#ccc8bf', lineHeight: 1.5 }}>{it.text}</span>
            <span style={{ fontSize: 11.5, color: 'rgba(212,175,55,0.6)', whiteSpace: 'nowrap', flexShrink: 0 }}>{it.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuickActions({ title = 'Quick Actions', actions = [] }) {
  return (
    <div style={{
      background: '#111114',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10,
      overflow: 'hidden',
      height: '100%',
    }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#e9e4d6' }}>{title}</span>
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.map((a) => (
          <Link
            key={a.id}
            to={a.to}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 14px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'transparent',
              color: '#ccc8bf',
              textDecoration: 'none',
              fontSize: 13.5,
              fontWeight: 500,
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(212,175,55,0.07)';
              e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)';
              e.currentTarget.style.color = '#d4af37';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.color = '#ccc8bf';
            }}
          >
            <span style={{ fontSize: 15 }}>{a.icon}</span>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
