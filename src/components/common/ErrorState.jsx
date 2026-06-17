import { Alert, Button } from 'react-bootstrap';

export default function ErrorState({ message = 'Đã có lỗi xảy ra.', onRetry }) {
  return (
    <Alert variant="danger" className="d-flex justify-content-between align-items-center">
      <span>{message}</span>
      {onRetry && (
        <Button size="sm" variant="outline-danger" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </Alert>
  );
}
