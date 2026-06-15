import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  // EXCEPTION #7: đang khôi phục session -> return null (chưa có Loading component)
  if (loading) return null;

  // Chưa đăng nhập
  if (!user) return <Navigate to="/login" replace />;

  // Có giới hạn role và user không thuộc danh sách -> cấm
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}