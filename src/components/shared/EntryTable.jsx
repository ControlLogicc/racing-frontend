import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatDate';

// Dùng ở staff (xem entry đã xác nhận) và jockey (lịch đua của mình) — read-only.
export default function EntryTable({ rows }) {
  const columns = [
    { key: 'raceName', label: 'Cuộc đua' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'jockeyName', label: 'Jockey' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'date',
      label: 'Ngày tạo / xác nhận',
      render: (r) => formatDate(r.confirmedAt || r.createdAt),
    },
  ];

  return <DataTable columns={columns} rows={rows} />;
}
