import DataTable from '../common/DataTable';
import { formatCurrency } from '../../utils/formatCurrency';

// showRaceName: true khi hiển thị nhiều race cùng lúc (referee/staff pages)
// showPrize: true khi có dữ liệu prize (spectator detail page)
// highlightFirst: highlight hàng vị trí 1 bằng màu gold nhạt
export default function RaceResultTable({ rows, showRaceName = false, showPrize = false, highlightFirst = false }) {
  const sorted = [...rows].sort((a, b) => a.position - b.position);

  const columns = [
    { key: 'position', label: 'Vị trí', render: (r) => r.position === 1 ? '🥇 1' : r.position === 2 ? '🥈 2' : r.position === 3 ? '🥉 3' : r.position },
    ...(showRaceName ? [{ key: 'raceName', label: 'Race' }] : []),
    { key: 'horseName', label: 'Ngựa' },
    { key: 'jockeyName', label: 'Jockey' },
    { key: 'finishTime', label: 'Thời gian về đích' },
    ...(showPrize ? [{ key: 'prize', label: 'Giải thưởng', render: (r) => formatCurrency(r.prize) }] : []),
  ];

  const rowClassName = highlightFirst
    ? (row) => row.position === 1 ? 'table-warning fw-bold' : undefined
    : undefined;

  return <DataTable columns={columns} rows={sorted} rowClassName={rowClassName} />;
}
