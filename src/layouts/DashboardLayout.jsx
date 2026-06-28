import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../routes/Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-content">
          <div className="dashboard-page-transition" key={location.pathname}>
            <Outlet /> {/* Nơi hiển thị các trang con (danh sách ngựa, user...) */}
          </div>
        </main>
      </div>
    </div>
  );
}
