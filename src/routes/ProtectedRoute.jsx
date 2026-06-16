import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// import Loading from '../components/common/Loading'; // Giả sử component này đã được tạo

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  // Khi đang khôi phục session, hiển thị một spinner toàn trang thay vì màn hình trắng
  // EXCEPTION #7: đang khôi phục session -> return null (chưa có Loading component)
  if (loading) return null; // TODO: Thay thế bằng <Loading fullPage={true} /> khi có

  // Chưa đăng nhập
  if (!user) return <Navigate to="/login" replace />;

  // Có giới hạn role và user không thuộc danh sách -> cấm
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}