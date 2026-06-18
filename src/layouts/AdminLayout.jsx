import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AdminLayout = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
      
      {/* Cột Trái: Sidebar cố định */}
      <div style={{ width: '280px', position: 'fixed', height: '100vh' }}>
        <Sidebar />
      </div>

      {/* Cột Phải: Nội dung động (Outlet) */}
      <div className="flex-grow-1" style={{ marginLeft: '280px', padding: '30px' }}>
        <div 
          className="container-fluid rounded p-4 h-100 shadow" 
          style={{ 
            backgroundColor: '#222', // Nền xám đen cho nội dung
            color: '#f8f9fa', // Chữ trắng sáng
            border: '1px solid #333'
          }}
        >
          {/* Outlet chính là nơi React nhúng các file Dashboard vào */}
          <Outlet /> 
        </div>
      </div>
      
    </div>
  );
};

export default AdminLayout;