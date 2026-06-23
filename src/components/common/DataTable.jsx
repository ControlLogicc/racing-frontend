import { Table } from 'react-bootstrap';

// Bảng dữ liệu dùng chung mọi trang CRUD.
// columns: [{ key, label, render?: (row) => node }]
export default function DataTable({ columns, rows, rowKey = 'id', rowClassName }) {
  return (
    <div className="table-responsive">
      <Table hover responsive variant="dark" className="align-middle mb-0 lux-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ borderColor: 'transparent' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className={rowClassName ? rowClassName(row) : undefined}>
              {columns.map((col) => (
                <td key={col.key} style={{ borderColor: 'transparent' }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
