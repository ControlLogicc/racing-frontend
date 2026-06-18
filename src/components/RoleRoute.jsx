import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RoleRoute = ({ requiredRole }) => {
  const { user } = useContext(AuthContext);
  return user?.role === requiredRole ? <Outlet /> : <Navigate to="/" replace />;
};

export default RoleRoute;