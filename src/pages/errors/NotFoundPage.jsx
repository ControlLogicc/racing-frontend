import { Container, Alert, Button } from 'react-bootstrap';

export default function NotFoundPage() {
  return (
    <Container className="py-5 text-center">
      <Alert variant="secondary">
        <Alert.Heading>404 — Không tìm thấy trang</Alert.Heading>
        <p className="mb-0">Trang bạn tìm không tồn tại.</p>
      </Alert>
      <Button href="/" variant="primary">Về trang chủ</Button>
    </Container>
  );
}