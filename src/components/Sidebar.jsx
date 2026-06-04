import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h3>Menu</h3>
      <div className="sidebar-menu">
        {/* NavLink sẽ tự động thêm class 'active' nếu bạn đang đứng ở URL đó */}
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
          Trang chủ
        </NavLink>
        <NavLink to="/schedule" className={({ isActive }) => isActive ? "active" : ""}>
          Lịch đua
        </NavLink>
        <NavLink to="/ranking" className={({ isActive }) => isActive ? "active" : ""}>
          Bảng xếp hạng
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;