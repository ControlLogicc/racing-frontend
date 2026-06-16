import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { normalizeRole } from '../constants/roles';

// Guard kiểm tra cả auth + role:
//  - chưa đăng nhập        -> /login
//  - sai role              -> /forbidden
//  - đúng role             -> render <Outlet />
// Hỗ trợ cả prop mới `allowedRoles` (mảng) và prop cũ `requiredRole` (chuỗi).
const RoleRoute = ({ allowedRoles, requiredRole }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  const roles = allowedRoles || (requiredRole ? [requiredRole] : []);
  const userRole = normalizeRole(user.role);
  const allowed = roles.map(normalizeRole);

  if (allowed.length > 0 && !allowed.includes(userRole)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;