import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { RACE_INVITATION_STATUS, canStaffReviewRegistration } from '../../constants/status';

const JOCKEY_STATUS_COLOR = {
  [RACE_INVITATION_STATUS.ACCEPTED]:                '#4caf7d',
  [RACE_INVITATION_STATUS.SENT]:                    '#D4AF37',
  [RACE_INVITATION_STATUS.WAITING_FOR_JOCKEY_RESPONSE]: '#D4AF37',
  [RACE_INVITATION_STATUS.REJECTED]:                '#e57373',
  [RACE_INVITATION_STATUS.DECLINED]:                '#e57373',
  [RACE_INVITATION_STATUS.EXPIRED]:                 '#888',
  [RACE_INVITATION_STATUS.CANCELLED]:               '#888',
};

const JOCKEY_STATUS_LABEL = {
  [RACE_INVITATION_STATUS.ACCEPTED]:                    'Đã nhận',
  [RACE_INVITATION_STATUS.SENT]:                        'Chờ phản hồi',
  [RACE_INVITATION_STATUS.WAITING_FOR_JOCKEY_RESPONSE]: 'Chờ phản hồi',
  [RACE_INVITATION_STATUS.REJECTED]:                    'Từ chối',
  [RACE_INVITATION_STATUS.DECLINED]:                    'Từ chối',
  [RACE_INVITATION_STATUS.EXPIRED]:                     'Hết hạn',
  [RACE_INVITATION_STATUS.CANCELLED]:                   'Đã huỷ',
};

// onApprove / onReject: khi truyền vào → hiện nút hành động cho Staff
export default function RegistrationTable({ rows, onApprove, onReject }) {
  const hasActions = !!(onApprove || onReject);

  const columns = [
    { key: 'raceName', label: 'Race' },
    { key: 'horseName', label: 'Ngựa' },
    {
      key: 'jockeyName',
      label: 'Jockey',
      render: (r) => {
        if (!r.jockeyName) return <span style={{ color: '#555' }}>Chưa mời</span>;
        const color = JOCKEY_STATUS_COLOR[r.jockeyStatus] ?? '#ccc';
        const label = JOCKEY_STATUS_LABEL[r.jockeyStatus] ?? r.jockeyStatus;
        return (
          <div>
            <div style={{ fontWeight: 600 }}>{r.jockeyName}</div>
            <div style={{ fontSize: 12, color }}>{label}</div>
          </div>
        );
      },
    },
    { key: 'submittedAt', label: 'Ngày nộp', render: (r) => formatDate(r.submittedAt) },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    ...(hasActions ? [{
      key: 'actions',
      label: 'Hành động',
      render: (r) => {
        if (!canStaffReviewRegistration(r.status)) return <span style={{ color: '#555', fontSize: 12 }}>—</span>;
        return (
          <div className="d-flex gap-2">
            {onApprove && (
              <button className="btn btn-sm btn-success" onClick={() => onApprove(r.id)}>
                ✓ Duyệt
              </button>
            )}
            {onReject && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => onReject(r.id)}>
                ✗ Từ chối
              </button>
            )}
          </div>
        );
      },
    }] : []),
  ];

  return <DataTable columns={columns} rows={rows} />;
}
