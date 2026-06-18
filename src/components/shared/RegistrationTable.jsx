import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { RACE_REGISTRATION_STATUS } from '../../constants/status';

// Dùng ở staff (duyệt registration) và owner (xem registration của mình, read-only nếu thiếu onApprove/onReject).
export default function RegistrationTable({ rows, onApprove, onReject }) {
  const showActions = !!(onApprove || onReject);

  const columns = [
    { key: 'raceName', label: 'Race' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'ownerName', label: 'Chủ ngựa' },
    { key: 'submittedAt', label: 'Ngày nộp', render: (r) => formatDate(r.submittedAt) },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (showActions) {
    columns.push({
      key: 'actions',
      label: 'Hành động',
      render: (r) =>
        r.status === RACE_REGISTRATION_STATUS.PENDING ? (
          <div className="d-flex gap-2">
            {onApprove && (
              <button className="btn-gold-sm" onClick={() => onApprove(r.id)}>Duyệt</button>
            )}
            {onReject && (
              <button className="btn-outline-gold-sm" onClick={() => onReject(r.id)}>Từ chối</button>
            )}
          </div>
        ) : (
          '—'
        ),
    });
  }

  return <DataTable columns={columns} rows={rows} />;
}
