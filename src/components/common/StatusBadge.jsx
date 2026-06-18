import { Badge } from 'react-bootstrap';
import { STATUS_LABEL, STATUS_BADGE_VARIANT } from '../../constants/status';

export default function StatusBadge({ status }) {
  return <Badge bg={STATUS_BADGE_VARIANT[status] || 'secondary'}>{STATUS_LABEL[status] || status}</Badge>;
}
