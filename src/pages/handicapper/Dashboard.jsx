import { useAuth } from '../../context/AuthContext';

const HandicapperDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="mb-4" style={{ color: '#D4AF37' }}>Hệ Thống Xếp Hạng 📊</h2>
      <p className="text-light">Chuyên viên đánh giá: {user?.fullName}</p>
      
      <div className="card bg-dark text-white shadow-sm" style={{ border: '1px solid #D4AF37' }}>
        <div className="card-body">
          <h5 style={{ color: '#D4AF37' }}>Cập nhật Rating Ngựa đua</h5>
          <p className="text-muted mb-0">Chờ luồng dữ liệu Official Result từ Backend truyền sang (P2 Optional).</p>
        </div>
      </div>
    </div>
  );
};

export default HandicapperDashboard;