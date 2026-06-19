import { Outlet } from 'react-router-dom';
import Navbar from '../routes/Navbar';

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main><Outlet /></main>
    </>
  );
}