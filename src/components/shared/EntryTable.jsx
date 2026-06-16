import DataTable from '../common/DataTable';
import { formatDate } from '../../utils/formatDate';

// Dùng ở staff (xác nhận entry) và jockey (lịch đua của mình, read-only).
export default function EntryTable({ rows }) {
  const columns = [
    { key: 'raceName', label: 'Race' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'jockeyName', label: 'Jockey' },
    { key: 'confirmedAt', label: 'Ngày xác nhận', render: (r) => formatDate(r.confirmedAt) },
  ];
  return <DataTable columns={columns} rows={rows} />;
}
