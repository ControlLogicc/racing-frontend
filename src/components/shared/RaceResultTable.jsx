import DataTable from '../common/DataTable';

// Dùng ở referee (nhập kết quả) và spectator (xem kết quả, read-only).
export default function RaceResultTable({ rows }) {
  const columns = [
    { key: 'raceName', label: 'Race' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'jockeyName', label: 'Jockey' },
    { key: 'position', label: 'Vị trí' },
    { key: 'finishTime', label: 'Thời gian về đích' },
  ];
  return <DataTable columns={columns} rows={[...rows].sort((a, b) => a.position - b.position)} />;
}
