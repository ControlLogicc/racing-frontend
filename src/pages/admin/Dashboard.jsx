import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="mb-4">Xin chào Ban tổ chức, {user?.fullName} 👋</h2>
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Mùa giải Đang mở</h5>
              <h2 className="display-6">2</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Ngựa chờ Duyệt</h5>
              <h2 className="display-6">15</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Lịch đấu Meeting</h5>
              <h2 className="display-6">4</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="card shadow-sm p-4">
        <h4>Cần xử lý (Tasks)</h4>
        <p className="text-muted">Tính năng duyệt Entry/Registration sẽ được cập nhật sau khi ERD chốt duyệt.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;