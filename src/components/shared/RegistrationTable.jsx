import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatDate';

export default function RegistrationTable({ rows }) {
  const columns = [
    { key: 'raceName', label: 'Race' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'ownerName', label: 'Chủ ngựa' },
    { key: 'submittedAt', label: 'Ngày nộp', render: (r) => formatDate(r.submittedAt) },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return <DataTable columns={columns} rows={rows} />;
}
