import { Button } from 'react-bootstrap';
import { BoxArrowRight } from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';

export default function LogoutButton({ variant = 'outline-danger', size }) {
  const { logout } = useAuth();
  return (
    <Button variant={variant} size={size} onClick={logout}>
      <BoxArrowRight className="me-2" />
      Đăng xuất
    </Button>
  );
}