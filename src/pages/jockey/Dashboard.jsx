import { useAuth } from '../../context/AuthContext';

const JockeyDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="mb-4" style={{ color: '#D4AF37' }}>Phòng Chờ Nài Ngựa 🏇</h2>
      <p className="text-light">Kỵ sư thi đấu: {user?.fullName}</p>
      
      <div className="card bg-dark text-white shadow-sm" style={{ border: '1px solid #D4AF37' }}>
        <div className="card-body">
          <h5 style={{ color: '#D4AF37' }}>Lịch thi đấu sắp tới (Assigned Races)</h5>
          <p className="text-muted mb-0">API Endpoint cần ghép: GET /api/v1/jockey/races</p>
        </div>
      </div>
    </div>
  );
};

export default JockeyDashboard;