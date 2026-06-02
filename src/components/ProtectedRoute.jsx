import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    // Chưa đăng nhập thì đá về trang Login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Đăng nhập rồi nhưng sai Role thì báo lỗi hoặc đá về trang chủ
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>🚫 Truy cập bị từ chối</h4>
          <p>Tài khoản của bạn ({user.role}) không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  // Hợp lệ thì render Layout/Page bên trong
  return <Outlet />;
};

export default ProtectedRoute;