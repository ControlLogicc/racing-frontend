import { Table } from 'react-bootstrap';
import './DataTable.css';

// Bảng dữ liệu dùng chung mọi trang CRUD.
// columns: [{ key, label, render?: (row) => node }]
export default function DataTable({ columns, rows, rowKey = 'id', rowClassName }) {
  return (
    <div className="table-responsive lux-table-shell">
      <Table hover responsive variant="dark" className="align-middle mb-0 lux-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className={rowClassName ? rowClassName(row) : undefined}>
              {columns.map((col) => (
                <td key={col.key} data-label={col.label}>
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
