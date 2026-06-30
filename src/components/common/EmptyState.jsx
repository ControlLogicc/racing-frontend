export default function EmptyState({ message = 'Chưa có dữ liệu' }) {
  return (
    <div
      className="text-center py-5"
      style={{ color: '#a09078', border: '1px dashed rgba(212, 175, 55, 0.3)', borderRadius: '14px' }}
    >
      {message}
    </div>
  );
}
