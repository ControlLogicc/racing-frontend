import { Outlet } from 'react-router-dom';
import Navbar from '../routes/Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-content">
          <Outlet /> {/* Nơi hiển thị các trang con (danh sách ngựa, user...) */}
        </main>
      </div>
    </div>
  );
}