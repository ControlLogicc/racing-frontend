import { Link } from 'react-router-dom';

const GOLD = '#D4AF37';

const ACCENT_BORDER = {
  primary: '#0d6efd',
  success: '#198754',
  warning: '#D4AF37',
  danger: '#dc3545',
  info: '#0dcaf0',
};

// Lưới thẻ summary. items: [{ id, label, value, hint, accent }]
export function StatCardGrid({ items = [] }) {
  return (
    <div className="row g-4 mb-4">
      {items.map((item) => (
        <div className="col-12 col-sm-6 col-xl-3" key={item.id}>
          <div
            className="card h-100 shadow-sm"
            style={{
              backgroundColor: '#1a1a1a',
              color: '#f5f5f5',
              borderLeft: `4px solid ${ACCENT_BORDER[item.accent] || GOLD}`,
              border: '1px solid #333',
            }}
          >
            <div className="card-body">
              <h6 className="text-uppercase mb-2" style={{ color: '#a0a0a0', fontSize: '12px', letterSpacing: '1px' }}>
                {item.label}
              </h6>
              <h2 className="display-6 fw-bold mb-1" style={{ color: GOLD }}>{item.value}</h2>
              {item.hint && <small className="text-muted">{item.hint}</small>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Khung "Recent Activity". items: [{ id, text, time }]
export function ActivityPanel({ title = 'Recent Activity', items = [] }) {
  return (
    <div
      className="card h-100 shadow-sm"
      style={{ backgroundColor: '#1a1a1a', color: '#f5f5f5', border: '1px solid #333' }}
    >
      <div className="card-header bg-transparent" style={{ borderBottom: `1px solid ${GOLD}` }}>
        <h5 className="mb-0" style={{ color: GOLD }}>{title}</h5>
      </div>
      <ul className="list-group list-group-flush">
        {items.length === 0 && (
          <li className="list-group-item bg-transparent text-muted">Chưa có hoạt động nào.</li>
        )}
        {items.map((it) => (
          <li
            key={it.id}
            className="list-group-item bg-transparent d-flex justify-content-between align-items-start"
            style={{ color: '#e9e9e9', borderColor: '#2a2a2a' }}
          >
            <span className="me-3">{it.text}</span>
            <small className="text-nowrap" style={{ color: GOLD, opacity: 0.8 }}>{it.time}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Khung "Quick Actions". actions: [{ id, label, to, icon }]
export function QuickActions({ title = 'Quick Actions', actions = [] }) {
  return (
    <div
      className="card h-100 shadow-sm"
      style={{ backgroundColor: '#1a1a1a', color: '#f5f5f5', border: '1px solid #333' }}
    >
      <div className="card-header bg-transparent" style={{ borderBottom: `1px solid ${GOLD}` }}>
        <h5 className="mb-0" style={{ color: GOLD }}>{title}</h5>
      </div>
      <div className="card-body d-flex flex-column gap-2">
        {actions.map((a) => (
          <Link
            key={a.id}
            to={a.to}
            className="btn text-start fw-semibold"
            style={{ border: `1px solid ${GOLD}`, color: GOLD, backgroundColor: 'transparent' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = '#111'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = GOLD; }}
          >
            <span className="me-2">{a.icon}</span>{a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
