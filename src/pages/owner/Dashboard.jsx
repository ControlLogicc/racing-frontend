import { useAuth } from '../../context/AuthContext';

const OwnerDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="mb-4" style={{ color: '#D4AF37' }}>Cổng Chủ Ngựa / Huấn luyện viên 🐎</h2>
      <p className="text-light">Xin chào, {user?.fullName}</p>
      
      <div className="card bg-dark text-white shadow-sm" style={{ border: '1px solid #D4AF37' }}>
         <div className="card-body">
           <h5 style={{ color: '#D4AF37' }}>Hồ sơ ngựa đang sở hữu</h5>
           <p className="text-muted mb-0">API Endpoint cần ghép: GET /api/v1/owner/horses</p>
         </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;