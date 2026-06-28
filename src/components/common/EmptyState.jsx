export default function EmptyState({ message = 'Chưa có dữ liệu' }) {
  return (
    <div
      className="text-center py-5"
      style={{ color: '#6f6650', border: '1px dashed rgba(212, 175, 55, 0.3)', borderRadius: '14px' }}
    >
      {message}
    </div>
  );
}
