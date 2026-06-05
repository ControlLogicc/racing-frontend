import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Import Layouts & Components
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx"; 

// Import Pages
import HomePage from "./pages/spectator/HomePage.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

/* === 1. TẠO LAYOUT CHO TRANG CÓ SIDEBAR === */
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Outlet /> 
        </div>
      </div>
    </>
  );
};

/* === 2. TẠO LAYOUT TRỐNG CHO TRANG LOGIN/REGISTER === */
const AuthLayout = () => {
  return (
    <>
      <Navbar /> 
      <Outlet /> 
    </>
  );
};

/* === 3. CHIA ROUTE CHÍNH === */
function App() {
  return (
    <Routes>
      
      {/* NHÓM 1: CÁC TRANG AUTH (KHÔNG CÓ SIDEBAR) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* NHÓM 2: CÁC TRANG CÓ SIDEBAR (TRANG CHỦ, LỊCH ĐUA...) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

    </Routes>
  );
}

export default App;