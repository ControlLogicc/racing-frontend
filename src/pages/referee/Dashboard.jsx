import { useAuth } from '../../context/AuthContext';

const RefereeDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="mb-4" style={{ color: '#D4AF37' }}>Phòng Giám Sát Trọng Tài ⚖️</h2>
      <p className="text-light">Giám sát viên (Steward): {user?.fullName}</p>
      
      <div className="card bg-dark text-white shadow-sm" style={{ border: '1px solid #D4AF37' }}>
        <div className="card-body">
          <h5 style={{ color: '#D4AF37' }}>Biên bản sự cố (Incidents / Objections)</h5>
          <p className="text-muted mb-0">Giao diện duyệt sẽ được dựng sau khi ERD chốt duyệt toàn bộ.</p>
        </div>
      </div>
    </div>
  );
};

export default RefereeDashboard;