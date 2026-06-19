import { Pagination as BsPagination } from 'react-bootstrap';

// Convention dự án: page bắt đầu từ 1, param `?page=&pageSize=` — Mục 16 CLAUDE.md
export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const items = [];
  for (let p = 1; p <= totalPages; p++) {
    items.push(
      <BsPagination.Item key={p} active={p === page} onClick={() => onPageChange(p)}>
        {p}
      </BsPagination.Item>
    );
  }

  return (
    <BsPagination className="justify-content-center mt-3">
      <BsPagination.Prev disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
      {items}
      <BsPagination.Next disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
    </BsPagination>
  );
}
