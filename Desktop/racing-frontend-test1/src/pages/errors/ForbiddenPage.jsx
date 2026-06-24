import { Container, Alert, Button } from 'react-bootstrap';

export default function ForbiddenPage() {
  return (
    <Container className="py-5 text-center">
      <Alert variant="warning">
        <Alert.Heading>403 — Không có quyền truy cập</Alert.Heading>
        <p className="mb-0">Bạn không được phép vào trang này.</p>
      </Alert>
      <Button href="/" variant="primary">Về trang chủ</Button>
    </Container>
  );
}