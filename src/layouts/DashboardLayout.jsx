// src/layouts/DashboardLayout.jsx
// MỘT layout dashboard dùng chung cho tất cả role (thay cho 6 layout riêng lẻ).
// Bố cục: Sidebar trái (cố định) + Header trên + vùng nội dung dùng <Outlet />.
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

export default function DashboardLayout() {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#0f0f11' }}>
      {/* Sidebar trái cố định */}
      <div style={{ width: '260px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 }}>
        <DashboardSidebar />
      </div>

      {/* Cột phải: header + nội dung */}
      <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: '260px' }}>
        <DashboardHeader />
        <main className="flex-grow-1 p-4" style={{ color: '#f5f5f5' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}