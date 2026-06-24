import { STATUS_LABEL, STATUS_BADGE_VARIANT } from '../../constants/status';
import '../../pages/owner/owner-theme.css';

const BADGE_CLASS_MAP = {
  primary: 'badge-gold',
  info: 'badge-info',
  warning: 'badge-warning',
  success: 'badge-success',
  danger: 'badge-danger',
  secondary: 'badge-info',
  dark: 'badge-info',
};

export default function StatusBadge({ status }) {
  const variant = STATUS_BADGE_VARIANT[status] || 'secondary';
  const badgeClass = BADGE_CLASS_MAP[variant] || 'badge-gold';
  const label = STATUS_LABEL[status] || status;

  return (
    <span className={`lux-badge ${badgeClass}`} style={{ display: 'inline-block' }}>
      {label}
    </span>
  );
}
