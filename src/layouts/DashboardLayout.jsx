import { Navbar, Container, Nav, Badge } from 'react-bootstrap';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LogoutButton from '../components/common/LogoutButton';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const { user } = useAuth();
  return (
    <>
      <Navbar bg="dark" variant="dark" className="px-3">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">🏇 FPT Horse Racing</Navbar.Brand>
          <Nav className="ms-auto d-flex align-items-center gap-3">
            <span className="text-light">
              {user?.full_name}{' '}
              <Badge bg="warning" text="dark">{user?.role}</Badge>
            </span>
            <LogoutButton size="sm" />
          </Nav>
        </Container>
      </Navbar>

      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 p-4">
          <Outlet />
        </div>
      </div>
    </>
  );
}