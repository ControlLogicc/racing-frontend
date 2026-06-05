import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const SpectatorDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="mb-4" style={{ color: '#D4AF37' }}>Khu Vực Khán Giả (Spectator) 🎟️</h2>
      <p className="text-light">Xin chào, {user?.fullName || 'Khách truy cập'}</p>
      
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card bg-dark text-white shadow-sm h-100" style={{ border: '1px solid #D4AF37' }}>
             <div className="card-body">
               <h5 style={{ color: '#D4AF37' }}>Lịch trình giải đua (Race Schedule)</h5>
               <p className="text-muted mb-3">Xem danh sách các trận đua sắp diễn ra và thông tin bốc thăm barrier.</p>
               <div className="p-2 rounded" style={{ backgroundColor: '#1a1a1a', borderLeft: '3px solid #D4AF37' }}>
                  <code className="text-light">GET /api/v1/races/schedule</code>
               </div>
             </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card bg-dark text-white shadow-sm h-100" style={{ border: '1px solid #D4AF37' }}>
             <div className="card-body">
               <h5 style={{ color: '#D4AF37' }}>Kết quả & Xếp hạng (Rankings)</h5>
               <p className="text-muted mb-3">Tra cứu thành tích của các ngựa đua và nài ngựa hàng đầu.</p>
               <div className="p-2 rounded" style={{ backgroundColor: '#1a1a1a', borderLeft: '3px solid #D4AF37' }}>
                  <code className="text-light">GET /api/v1/rankings</code>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectatorDashboard;